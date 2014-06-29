// Carregando todos os pacotes necessários
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var child = require('child_process');

// A rota principal, que servirá somente
// para enviar o HTML com o web terminal
app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});

// Vamos escutar por conexões no websocket
io.on('connection', function(socket){
    console.log('Conectado');

    // Cada conexão receberá um terminal bash, por isso
    // precisamos executar ele aqui. Acho que os usuários
    // windows podem trocar o bash por cmd, não tenho certeza.
    var bash = child.spawn('bash');

    // Quando o bash retornar alguma coisa no seu
    // standard output, redirecionaremos para nossa
    // interface web
    bash.stdout.on('data', function(buff){
        socket.emit('data', buff.toString());
    });

    // Vamos fazer a mesma coisa acima porém para
    // o output de erro do bash
    bash.stderr.on('data', function(buff){
        socket.emit('data', buff.toString());
    });

    // Na via contrária, quando recebermos dados do
    // socket conectado, redirecionamos para o input padrão do
    // bash.
    socket.on('data', function(data){
        bash.stdin.write(data);
    });
});

// Easy as pie.
server.listen(8080);
