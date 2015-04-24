#!/usr/bin/perl
#use strict;
use warnings;

use Data::Dumper qw(Dumper);
use Data::Structure::Util qw/unbless/;
use DateTime qw();
use DateTime::Format::Strptime qw();
use HTTP::Headers;
use HTTP::Request::Common; 
use HTTP::Request; 
use JSON;
use LWP::Simple; 
use LWP::UserAgent; 
use MIME::Base64;
use Plack::Builder;
use Plack::Request;
use REST::Client;
use Storable;
use String::Truncate qw(elide);
use URI::Escape;
use XML::Simple;
$Data::Dumper::Sortkeys = 1;
 
my $app = sub {
  my $env = shift;
  my ($html,$dist,$latlong);

  my $request = Plack::Request->new($env);
 
  if ($request->param('latlong')) {
      $latlong = $request->param('latlong');
  }

  if ($request->param('dist')) {
      $dist =  $request->param('dist');
  }

  my @vals1 = split(',',$latlong);
  $html = getContent($vals1[0],$vals1[1],$dist);

  return [
    '200',
    [ 'Content-Type' => 'text/json' ],
    [ $html ],
  ];
};

builder {
	enable "JSONP", callback_key => 'callback';
	$app;
};

sub getContent {

  my $lat      = $_[0];
  my $long     = $_[1];
  my $distance = $_[2];
  my $offset   = $_[3];

  my $headers = {Accept => 'application/json'};
  my $client = REST::Client->new();

  ##
  # Get the CAPI data
  ##

  $client->setHost('http://cdn.newsapi.com.au');

  $client->GET(
      'content/v1/?format=json&geoDistance=' . $lat . ',' . $long . ":" . $distance . '&type=news_story&origin=methode&includeRelated=false&includeBodies=true&includeFutureDated=false&pageSize=10&offset=0&maxRelatedLevel=1&api_key=r7j3ufg79yqkpmszf73b8ked',
      $headers
  );

  my @resset;
  my $res2;

  my $response = from_json($client->responseContent());

  my $results = $response->{'results'};

  foreach my $result (@$results){
    my $resultSimple;
    $resultSimple->{'headline'}            =  $result->{'title'};
    $resultSimple->{'standfirst'}          =  $result->{'standFirst'};
    $resultSimple->{'paidStatus'}          =  $result->{'paidStatus'};
    $resultSimple->{'originalSource'}      =  'news';
    $resultSimple->{'thumbnail'}{'uri'}    =  $result->{'thumbnailImage'}{'link'};
    $resultSimple->{'thumbnail'}{'width'}  =  $result->{'thumbnailImage'}{'width'};
    $resultSimple->{'thumbnail'}{'height'} =  $result->{'thumbnailImage'}{'height'};
    $resultSimple->{'url'}                 = $result->{'link'};
    $resultSimple->{'location'}            =  $result->{'locationGeoPoints'};

    #print "Array: " . Dumper($resultSimple) . "\n";

    push @resset, $resultSimple;
    #print "help " . $resset[$count] . "\n";
    
  }

  ## 
  # Add the REA stuff in
  ##

  my $ua = LWP::UserAgent->new;
  my $json = JSON->new;
  my $strp = DateTime::Format::Strptime->new(
        pattern   => '%Y-%m-%dT%H:%M:%S',
        locale    => 'en_AU',
        time_zone => 'Australia/Sydney',
  );

  my $base = 'http://trial1060.api.mashery.com/v1/services/listings/search?query=';
  my $apiKey = 'ug5ddujnfet3vuahkwra8ua8';

  my $channel = uri_escape('"channel":"buy"');
  my $pageNum = 1;
  my $page = uri_escape('"page":"' . $pageNum . '"');
  my $pageSize = uri_escape('"pageSize":"20"');
  my $filter = uri_escape('"filters":{"surroundingSuburbs":false}');
  my $radial = uri_escape('"radialSearch":{"center":[' . "$lat,$long" . ']}');

  my $url = "${base}{$channel,$page,$pageSize,$filter,$radial}&api_key=$apiKey";

  my $reaResults = cache_get('rea', $lat, $long);

  if (!defined $reaResults) {
    my $res = $ua->get($url);

    if ($res->is_success) {
      my $listings = $json->decode($res->content);

      foreach my $listing (@{$listings->{tieredResults}->[0]->{results}}) {
        next unless $listing->{inspectionsAndAuctions};

        foreach my $inspection (@{$listing->{inspectionsAndAuctions}}) {
          # We only care about auctions
          next unless $inspection->{auction};

          # We only care about auctions in our specified radius
          next unless (distance($lat, $long, $listing->{address}->{location}->{latitude}, $listing->{address}->{location}->{longitude}) <= $distance);

          # We only care about auctions in the next week
          my $auctionTime = $strp->parse_datetime($inspection->{startTime});
          my $days = $auctionTime->subtract_datetime(DateTime->now());
          next unless $days->in_units('days') <= 7;

          my $standfirst = $listing->{description};
          $standfirst =~ s|<.+?>||g;

          push @$reaResults, {
            url => $listing->{'_links'}->{short}->{href},
            headline => "Auction: " .
                   $inspection->{dateDisplay} .
                   ", " . $inspection->{startTimeDisplay} .
                   ". " . $listing->{title},
            standfirst => elide($standfirst, 150, {at_space => 1}),
            paidStatus => 'NON_PREMIUM',
            originalSource => 'REA',
            location => [{
              latitude => $listing->{address}->{location}->{latitude},
              longitude => $listing->{address}->{location}->{longitude}
            }],
            thumbnail => {
              uri => $listing->{mainImage}->{server} . '/120x90' . $listing->{mainImage}->{uri},
              width => 120,
              height => 90,
            }
          };
        }
      }
      cache_set('rea', $reaResults, $lat, $long);
    }
    else {
      warn $res->status_line;
    }
  }

  push (@resset, @$reaResults);

  ##
  # Add in the traffic info
  ##

  my $incidentsUrl = 'http://livetraffic.rta.nsw.gov.au/traffic/hazards/incident-open.json';

  $res = $ua->get($incidentsUrl);

  if ($res->is_success) {
    my $incidents = $json->decode($res->content);

    foreach my $incident (@{$incidents->{features}}) {
      if (distance($lat, $long, $incident->{geometry}->{coordinates}->[1], $incident->{geometry}->{coordinates}->[0]) <= $distance) {
        push @resset, {
          url => 'https://www.livetraffic.com/',
          headline => $incident->{properties}->{displayName},
          standfirst => $incident->{properties}->{headline},
          paidStatus => 'NON_PREMIUM',
          originalSource => 'traffic',
          location => {
            latitude => $incident->{geometry}->{coordinates}->[1],
            longitude => $incident->{geometry}->{coordinates}->[0]
          },
          thumbnail => {
            uri => 'http://placehold.it/120x90',
            width => 120,
            height => 90,
          }
        };
      }
    }
  }

  ##
  # Add the tweets
  ##

	my $domain = 'search.gnip.com';
	my $username = 'rchoi+gnip@twitter.com';
	my $password = '#NewsFoundry';

	my $term = '#NewsFoundry';

	# uncomment below for tweets around News Corp 

	my $location = 'point_radius:[' . $long . ' ' . $lat . ' 5.0mi]';
	#$res2->{'locaton'} =  $location;
	$term = $term . ' ' . $location;

	# below returns all tweets in last 30 days for rchoi
	$term = uri_escape($term);
	my $server_endpoint = "https://$domain/accounts/dpr-content/search/choi.json?publisher=twitter&query=$term&maxResults=10";

	# below returns counts for term daily
	# my $server_endpoint = "https://$domain/accounts/dpr-content/search/choi/counts.json?publisher=twitter&query=$term&bucket=day";

	my $req = GET $server_endpoint;
	$req->authorization_basic($username, $password);

	my $agent = LWP::UserAgent->new;
	my $resp = $agent->request($req); 

	if ($resp->is_success) {
	my $message = from_json($resp->decoded_content);

	my $results = $message->{'results'};

  foreach my $result (@$results){

	push @resset, {
          url => $result->{'link'},
          headline => $result->{'object'}{'summary'},
          standfirst => $result->{'object'}{'summary'},
          paidStatus => 'NON_PREMIUM',
          originalSource => 'twitter',
          location => [{
            latitude => $result->{'geo'}{'coordinates'}[0],
            longitude => $result->{'geo'}{'coordinates'}[1]
          }],
          thumbnail => {
            uri => $result->{'actor'}{'image'},
            width => 100,
            height => 100,
          }
        };
    }

	#my $message = $resp->decoded_content;
	#print "Received reply: " . Dumper($message) . "\n";
	}
	else {
	}

  ## Add Eventful events


  my $eventurl = "http://api.eventful.com/rest/events/search?app_key=DwG227bNxf2ZXbSS&keywords=books&location=$lat,$long&within=$distance&units=km&date=This+Week&page_size=50";

  $res = $ua->get($eventurl);

  if ($res->is_success) {
    my $xs = XML::Simple->new();    
    my $events = $xs->XMLin($res->content);

    foreach my $event (values %{$events->{events}->{event}}) {
      my $description = $event->{description};
      $description =~ s|<.+?>||g;

        push @resset, {
          url => $event->{url},
          headline => $event->{title},
          standfirst => elide($description, 150, {at_space => 1}),
          paidStatus => 'NON_PREMIUM',
          originalSource => 'EVENTFUL',
          location => [{
            latitude => $event->{latitude},
            longitude => $event->{longitude}
          }],
          thumbnail => {
            uri => $event->{image}->{medium}->{url},
            width => $event->{image}->{medium}->{width},
            height => $event->{image}->{medium}->{height},
          }
        };
    }
  }
  else {
    warn $res->status_line;
  }


$res2->{'resultSet'} = \@resset;
$res2->{'resultSize'} = scalar @resset;

#print "Hash: " . Dumper($res2) . "\n";

return (to_json($res2, {utf8 => 1}));

}

sub distance {
  my ($lat1, $lon1, $lat2, $lon2) = @_;
  my $theta = $lon1 - $lon2;
  my $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist  = acos($dist);
    $dist = rad2deg($dist);
    $dist = $dist * 60 * 1.1515;
    $dist = $dist * 1.609344;
  return ($dist);
}

sub acos {
  my ($rad) = @_;
  my $ret = atan2(sqrt(1 - $rad**2), $rad);
  return $ret;
}

sub deg2rad {
  my ($deg) = @_;
  my $pi = atan2(1,1) * 4;
  return ($deg * $pi / 180);
}

sub rad2deg {
  my ($rad) = @_;
  my $pi = atan2(1,1) * 4;
  return ($rad * 180 / $pi);
}

sub cache_get {
  my ($source, $lat, $long) = @_;

  my $filename = "$source-$lat-$long.storable";

  # Cache expiry set to 1 hour
  if (-e $filename && (stat($filename))[9] >= (time() - 3600)) {
    $arrayref = retrieve($filename);
  }
  return $arrayref;
}

sub cache_set {
  my ($source, $data, $lat, $long) = @_;

  my $filename = "$source-$lat-$long.storable";
  store($data, $filename)
}
