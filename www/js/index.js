if(localStorage.getItem('banco') !== null && localStorage.getItem('banco') !== ""){
    banco = JSON.parse(localStorage.getItem('banco'));
    temBanco = true;
} else {
    console.log("Não tem um banco de dados ainda!")
    temBanco = false;
}
var ondaSonora = document.getElementById('ondaSonora')
var btnFalar = document.getElementById('BtnFalar');
var somTransicao = new Audio('../music/transicao.mp3');

btnFalar.addEventListener('touchstart', escutando);
btnFalar.addEventListener('touchend', parouDeEscutar);

var arrayContatos = [{
    "Gabriela": "555180187026",
    "Luana": "555182811852"
}]

var ultimoElemento = "";


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
    window.plugins.speechRecognition.startListening(
    function(dados) {
        $.each(dados, function(index,texto) {
            $("#perguntaIndex").html("").append(texto);
            var pergunta = $("#perguntaIndex").html();

            // Verificar se tem banco
            if(temBanco){
                $.each(banco, function(index,item) {
                    // verificar se a pergunta entendida é igual a pergunta falada
                    if(pergunta == item.pergunta){
                        falar(item.resposta, item.resposta, false)
                    }
                })
            }

            if(pergunta == "acessar memórias" || pergunta == "acessar memória"){
                somTransicao.play();
                app.views.main.router.navigate('/memorias/');
            }

            if(pergunta == "quem é a sua criadora" || pergunta == "quem é a tua criadora" || pergunta == "quem é tua criadora"){
                var texto = 'Minha criadora é a Gabriela Ramires, uma mulher muito charmosa, bonita e inteligente. Ela também é bem modesta.';
                falar(texto, texto, false)
            }

            // buscando contatos
            arrayContatos.forEach(contato => {
                // Obtém as chaves do objeto
                var nomesContato = Object.keys(contato);
            
                // Itera sobre as chaves
                nomesContato.forEach(nome => {
                    if(pergunta == "Mandar mensagem para "+nome || pergunta == "mandar mensagem para "+nome) {
                        var texto = "Qual mensagem você quer mandar para "+nome+"?"; 
                        apenasFalar(texto, nome)
                    }
                    
                });
            });


        })

    },
    //erro
    function(erro) {
        app.dialog.alert('Houve um erro ao escutar: '+erro)
    }, options)

};


function parouDeEscutar() {
    $("#ondaSonora").addClass("display-none");
}

function falar(r_escrita, r_falada, rota){
    TTS.speak({
        text: r_falada,
        locale: 'pt-BR',
        rate: 1
    }, function () {            
        console.log("A assistente falou: "+r_escrita)
        if(rota){
            app.views.main.router.navigate(rota);
        }
    }, function (erro) {        
        app.dialog.alert('Houve um erro: '+erro)
    });

    var typed = new Typed('#respostaIndex', {
        // Waits 1000ms after typing "First"
        strings: [r_escrita+'^1000', ''],
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
}

function apenasFalar(fala, nome){
    TTS.speak({
        text: fala,
        locale: 'pt-BR',
        rate: 1
    }, function () {            
        let opt = {
            language:"pt-BR",
            showPopup: false
        }

        $("#respostaIndex").html("")
        
        // escutando a mensagem para enviar
        window.plugins.speechRecognition.startListening(
        function(dados) {
            $("#respostaIndex").html("")
            for (var index = 0; index < dados.length; index++) {
                var msg = dados[index];
                $("#respostaIndex").html("").append(msg);
            }
            ultimoElemento = dados[dados.length - 1];
            var mensagem = ultimoElemento;
            mandarMensagem(mensagem, nome); 
            
        },function(err){
            console.log("Houve um erro ao escutar")
        }, opt);
 
    }, function (erro) {        
        app.dialog.alert('Houve um erro: '+erro)
    });

}

function mandarMensagem(mensagem, pessoa){
    const url = "https://api-whatsapp-v1.onrender.com/send-message";
    const nome = pessoa
    const number = arrayContatos[0][pessoa]
    //const number = "555180187026"
    app.dialog.alert(number)
    const message = mensagem;
    const data = new URLSearchParams();
    data.append('grant_type', 'Envio WhatsApp');
    data.append('number', number);
    data.append('message', message);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        // Aqui você pode processar a resposta, se necessário.
        console.log(data);

    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });

}




