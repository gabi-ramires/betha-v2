
//ASSIM QUE A ROTA INDEX COMEÇAR
// 1 - verificando se tem permissão
window.plugins.speechRecognition.hasPermission(
    function(permissao) {
      if(!permissao) {
          window.plugins.speechRecognition.requestPermission(
          function(temPermissao) {
              app.dialog.alert('Permissão concedida: '+temPermissao)
          }, function(erro) {
              app.dialog.alert('Request Permission error: '+erro)
          })
      }
    },
    function(error) {
      app.dialog.alert('hasPermission error: '+error)
  })
  
  // CLICOU NO BOTÃO FALAR
  $("#BtnFalar").on('click',function(){
      ouvindo();
  });
  
function ouvindo() {
      var bipEscuta = new Audio('music/bipEscuta.mp3');
      bipEscuta.play();
  
      let options = {
          language:"pt-BR",
          showPopup: false,
          showPartial: true
      }
         
      //COMEÇOU A ESCUTAR
      window.plugins.speechRecognition.startListening( //sucesso
      function(dados) {
          $.each(dados, function(index,texto) {
              $("#pergunta").html("").append(texto);
              var pergunta = $("#pergunta").html().toLowerCase();
  
              if(pergunta == "acessar memórias" || pergunta == "acessar memória"){
                  app.views.main.router.navigate('/memorias/');
              }
  
              if(pergunta == "qual é o seu nome" || pergunta == "qual é seu nome"){
                  TTS.speak({
                      text: 'Meu nome é Betha!',
                      locale: 'pt-BR',
                      rate: 0.80
                  }, function () {            
                      var typed = new Typed('#resposta', {
                          // Waits 1000ms after typing "First"
                          strings: ['Meu nome é Betha!^1000', ''],
                          typeSpeed:40,
                          showCursor: false,
                          onComplete: function (self) {
                              toastBottom = app.toast.create({
                                  text: 'Fala concluída.',
                                  closeTimeout: 2000,
                              });
                              toastBottom.open();
                          }
                          });
                  }, function (erro) {        
                      app.dialog.alert('Houve um erro: '+erro)
                  });
              }
  
              if(pergunta == "quem é a sua criadora" || pergunta == "quem é a tua criadora" || pergunta == "quem é tua criadora"){
                  TTS.speak({
                      text: 'Minha criadora é a Gabriela Ramires, uma mulher muito charmosa, bonita e inteligente. Ela também é bem modesta.',
                      locale: 'pt-BR',
                      rate: 0.80
                  }, function () {            
                      var typed = new Typed('#resposta', {
                          // Waits 1000ms after typing "First"
                          strings: ['Minha criadora é a Gabriela Ramires, uma mulher muito charmosa, bonita e inteligente. Ela também é bem modesta.^1000', ''],
                          typeSpeed:40,
                          showCursor: false,
                          onComplete: function (self) {
                              toastBottom = app.toast.create({
                                  text: 'Fala concluída.',
                                  closeTimeout: 2000,
                              });
                              toastBottom.open();
                          }
                          });
                  }, function (erro) {        
                      app.dialog.alert('Houve um erro: '+erro)
                  });
              }
          })
      },
      //erro
      function(erro) {
          app.dialog.alert('Houve um erro: '+erro)
      }, options)
};

function iniciarEscutaAutomatica(){
    window.plugins.speechRecognition.startListening( //sucesso
      function(dados) {
          $.each(dados, function(index,texto) {
              $("#pergunta").html("").append(texto);
              var pergunta = $("#pergunta").html().toLowerCase();
  
              if(pergunta == "alexa" || pergunta == "alexia"){
                ouvindo();
              }
        })
    })
}

setInterval(iniciarEscutaAutomatica, 1);


  
  
  