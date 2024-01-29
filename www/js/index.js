var ondaSonora = document.getElementById('ondaSonora')
var btnFalar = document.getElementById('BtnFalar');

btnFalar.addEventListener('touchstart', escutando);
btnFalar.addEventListener('touchend', parouDeEscutar);

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

// 2 - Escutando
function escutando(){
    $("#ondaSonora").removeClass("display-none");

    let options = {
        language:"pt-BR",
        showPopup: false,
        showPartial: true
    }
       
    //começou a escutar
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
                                position: 'center',
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
                                position: 'center',
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


function parouDeEscutar() {
    $("#ondaSonora").addClass("display-none");
}



