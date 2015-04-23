my $root;

BEGIN {
    use File::Basename ();
    use File::Spec     ();

    $root = File::Basename::dirname(__FILE__);
    $root = File::Spec->rel2abs($root);

    use REST::Client;
    use JSON;

    use Data::Dumper;
    use MIME::Base64;

    use LWP::UserAgent qw();
    use JSON qw();
    use URI::Escape qw(uri_escape);
    use String::Truncate qw(elide);

    unshift @INC, "$root/../../lib";
}

use PocketIO;

use JSON;
use Plack::App::File;
use Plack::Builder;
use Plack::Middleware::Static;

my $nicknames = {};

builder {
    mount '/socket.io/socket.io.js' =>
      Plack::App::File->new(file => "$root/public/socket.io.js");

    mount '/socket.io/static/flashsocket/WebSocketMain.swf' =>
      Plack::App::File->new(file => "$root/public/WebSocketMain.swf");

    mount '/socket.io/static/flashsocket/WebSocketMainInsecure.swf' =>
      Plack::App::File->new(file => "$root/public/WebSocketMainInsecure.swf");

    mount '/socket.io' => PocketIO->new(
        handler => sub {
            my $self = shift;

            $self->on(
                'search' => sub {
                    my $self = shift;
                    my ($latlong,$radius) = @_;
                    #$message = getContent($latlong,$radius);
                    $message = getContent('-33.885742,151.209233','5');

                    $self->get('nick' => sub {
                        my ($self, $err, $nick) = @_;

                        $self->sockets->emit('user message', $message);
                    });
                }
            );

            $self->on(
                'nickname' => sub {
                    my $self = shift;
                    my ($nick, $cb) = @_;

                    if ($nicknames->{$nick}) {
                        $cb->(JSON::true);
                    }
                    else {
                        $cb->(JSON::false);

                        $self->set(nick => $nick);

                        $nicknames->{$nick} = $nick;

                        $self->broadcast->emit('announcement', $nick . ' connected');
                        $self->sockets->emit('nicknames', $nicknames);
                    }
                }
            );

            $self->on(
                'disconnect' => sub {
                    my $self = shift;

                    $self->get(
                        'nick' => sub {
                            my ($self, $err, $nick) = @_;

                            delete $nicknames->{$nick};

                            $self->broadcast->emit('announcement',
                                $nick . ' disconnected');
                            $self->broadcast->emit('nicknames', $nicknames);
                        }
                    );
                }
            );
        }
    );

    mount '/' => builder {
        enable "Static",
          path => qr/\.(?:js|css|jpe?g|gif|png|html?|swf|ico)$/,
          root => "$root/public";

        enable "SimpleLogger", level => 'debug';

        my $html = do {
            local $/;
            open my $fh, '<', "$root/public/chat.html"
              or die $!;
            <$fh>;
        };

        sub {
            [   200,
                [   'Content-Type'   => 'text/html',
                    'Content-Length' => length($html)
                ],
                [$html]
            ];
        };
    };
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

  foreach $result (@$results){
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
$res->{'resultSet'} = \@resset;
$res->{'resultSize'} = $count;

#print "Hash: " . Dumper($res) . "\n";

return (to_json($res));

}
