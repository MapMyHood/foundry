#!/usr/bin/perl
use strict;
use warnings;

use Plack::Request;
use REST::Client;
use JSON;

use Data::Dumper;
use MIME::Base64;
 
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
    [ 'Content-Type' => 'text/plain' ],
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
  my $res;
  my @resset;

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
  


$res->{'resultSet'} = \@resset;
$res->{'resultSize'} = $count;

#print "Hash: " . Dumper($res) . "\n";

return (to_json($res));

}