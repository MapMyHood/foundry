#!/usr/bin/perl
use strict;
use warnings;

use Plack::Request;
use REST::Client;
use JSON;

use Data::Dumper;
use MIME::Base64;

use LWP::UserAgent qw();
use JSON qw();
use Data::Structure::Util qw/unbless/;
use URI::Escape qw(uri_escape);
use String::Truncate qw(elide);
 
use Data::Dumper qw(Dumper);
$Data::Dumper::Sortkeys = 1;
 
my $app = sub {
  my $env = shift;
  my ($html, $latlong,$dist);

  my $request = Plack::Request->new($env);
 
  if ($request->param('latlong')) {
      $latlong =  $request->param('latlong');
  }

  if ($request->param('dist')) {
      $dist =  $request->param('dist');
  }

  $html = getContent($latlong,$dist);

  return [
    '200',
    [ 'Content-Type' => 'text/json' ],
    [ $html ],
  ];
};

sub getContent {

  my $latlong = $_[0];
  my $distance = $_[1];
  my $offset = $_[2];

  my $headers = {Accept => 'application/json'};
  my $client = REST::Client->new();


  $client->setHost('http://cdn.newsapi.com.au');

  $client->GET(
      'content/v1/?format=json&geoDistance=' . $latlong . ":" . $distance . '&type=news_story&origin=methode&includeRelated=false&includeBodies=true&includeFutureDated=false&pageSize=10&offset=0&maxRelatedLevel=1&api_key=r7j3ufg79yqkpmszf73b8ked',
      $headers
  );

  my $count = 0;
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

    $resset[$count] = $resultSimple;
    #print "help " . $resset[$count] . "\n";
    
    $count++;

  }

  ## Add the REA stuff in
  my $ua = LWP::UserAgent->new;
  my $json = JSON->new;

  my $base = 'http://trial1060.api.mashery.com/v1/services/listings/search?query=';
  my $apiKey = 'ug5ddujnfet3vuahkwra8ua8';

  my $channel = uri_escape('"channel":"buy"');
  my $pageNum = 1;
  my $page = uri_escape('"page":"' . $pageNum . '"');
  my $pageSize = uri_escape('"pageSize":"20"');
  my $filter = uri_escape('"filters":{"surroundingSuburbs":false}');
  my $radial = uri_escape('"radialSearch":{"center":[' . "$latlong" . ']}');

  my $url = "${base}{$channel,$page,$pageSize,$filter,$radial}&api_key=$apiKey";

  my $res = $ua->get($url);

  if ($res->is_success) {
    my $listings = $json->decode($res->content);

    foreach my $listing (@{$listings->{tieredResults}->[0]->{results}}) {
      next unless $listing->{inspectionsAndAuctions};

      foreach my $inspection (@{$listing->{inspectionsAndAuctions}}) {
        next unless $inspection->{auction};

        my $standfirst = "Auction on " .
                 $inspection->{dateDisplay} .
                 " at " . $inspection->{startTimeDisplay} .
                 ". " . $listing->{description};
        $standfirst =~ s|<.+?>||g;

        push @resset, {
          url => $listing->{'_links'}->{short}->{href},
          headline => $listing->{title},
          standfirst => elide($standfirst, 150, {at_space => 1}),
          paidStatus => 'NON_PREMIUM',
          originalSource => 'REA',
          location => {
            latitude => $listing->{address}->{location}->{latitude},
            longitude => $listing->{address}->{location}->{longitude}
          },
          thumbnail => {
            uri => $listing->{mainImage}->{server} . '/120x90' . $listing->{mainImage}->{uri},
            width => 120,
            height => 90,
          }
        };
        $count++;
      }
    }
  }
  else {
    warn $res->status_line;
  }


$res2->{'resultSet'} = \@resset;
$res2->{'resultSize'} = $count;

#print "Hash: " . Dumper($res2) . "\n";

return (to_json($res2));

}