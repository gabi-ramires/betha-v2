// INICIALIZAÇÃO DO SEACHBAR
var searchbar = app.searchbar.create({
    el: '.searchbar',
    searchContainer: '.list',
    searchIn: '.item-title',
    on: {
      search(sb, query, previousQuery) {
        console.log(query, previousQuery);
      }
    }
});

$("#add").on("click", function(){
  //$("#perguntaEscrita").focus();
    // esvaziando os campos
    $("#perguntaEscrita").val("");
    $("#perguntaEntendida").val("");
});

// BANCO DE DADOS LOCAL WEBSQL
// cria o banco se não existir ou abre o banco se existir
var db = window.openDatabase("Banco","1.0","Banco",25000000);

db.transaction(criarTabela,
  function(err){
    app.dialog.alert('Erro ao criar tabela: '+err);
  },
  function(){
    console.log('Sucesso ao realizar transação Criar Tabela');
  }
);

function criarTabela(tx){
  tx.executeSql("CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key,p_escrita varchar(255),p_falada varchar(255), r_escrita varchar(255), r_falada varchar(255))");
}

function listarMemorias(){
  db.transaction(selecionarTudo,
    function(err){
      app.dialog.alert('Erro ao realizar transação Selecionar Tudo: '+err)
    },
    function(){
      console.log('Sucesso ao realizar Transação Selecionar Tudo!')
    })
}

function selecionarTudo(tx){
  tx.executeSql('SELECT * FROM memorias ORDER BY id',[],
  function(tx, dados){
    var linhas = dados.rows.length;

    if(linhas == 0){
      $("#comMemorias").addClass("display-none");
      $("#semMemorias").removeClass("display-none");
    } else {
      $("#comMemorias").removeClass("display-none");
      $("#semMemorias").addClass("display-none");

      $("#quantidade").html(linhas);
      $("#listaPerguntas").empty();

      for (let i = 0; i < linhas; i++) {
        $("#listaPerguntas").append(`
        <div data-id="${dados.rows.item(i).id}"
             data-pescrita="${dados.rows.item(i).p_escrita}"
             data-pfalada="${dados.rows.item(i).p_falada}"
             data-rescrita="${dados.rows.item(i).r_escrita}"
             data-rfalada="${dados.rows.item(i).r_falada}"
             class="list media-list list-outline-ios list-strong-ios list-dividers-ios margin-left margin-right"
         >
          <ul>
            <li>
              <a class="item-link item-content popup-open" data-popup=".popup-resposta">
                <div class="item-inner">
                  <div class="item-title-row">
                    <div class="item-title txt-white"><i class="mdi mdi-pencil"></i> ${dados.rows.item(i).p_escrita}</div>
                    <div class="item-after">
                      <span class="badge padding-left padding-right ">ID: ${dados.rows.item(i).id}</span>
                    </div>
                  </div>
                  <div class="item-title" txt-white><i class="mdi mdi-microphone"></i> ${dados.rows.item(i).p_falada}</div>
                </div>
              </a>
            </li>
          </ul>
        </div>
        `)
      }

      $(".list").on('click', function(){
        var id = $(this).attr('data-id');
        localStorage.setItem('idItem',id);
        var perguntaEscrita = $(this).attr('data-pescrita');
        var perguntaFalada = $(this).attr('data-pfalada');
        var respostaEscrita = $(this).attr('data-rescrita');
        var respostaFalada = $(this).attr('data-rfalada');

        $("#idItem").html(" ID: "+id)

        if(respostaEscrita !== null || respostaEscrita !== "null"){
          $("#input_rescrita").var(respostaEscrita);
        }

        if(respostaFalada !== null || respostaFalada !== "null"){
          $("#input_rfalada").var(respostaFalada);
        }

        $("#input_rescrita").focus();

      });

      // perdeu o foco, vai copiar resposta escrita para resposta falada
      $("#input_rescrita").on('blur', function(){
        $("#input_rfalada").val($("#input_rescrita").val());
      });

      //clicou no Ouvir
      $("#BtnFalarResposta").on('click', function(){
        var fala = $("#input_rfalada").val();
        TTS.speak({
          text: fala,
          locale: 'pt-BR',
          rate: 0.80
      }, function () {            
          console.log("Assistente falou!")
      }, function (erro) {        
          app.dialog.alert('Houve um erro: '+erro)
      });
      });

      $("#salvarRespostas").on("click", function(){
        var r_escrita = $("#input_rescrita").val();
        var r_falada = $("#input_rfalada").val();
        var id_res = localStorage.getItem('idItem');

        db.transaction(atualizarTabela,
          function(err){
            app.dialog.alert('Erro ao realizar transação de Atualizar Tabela: '+err)
          },
          function(){
            console.log("Sucesso ao realizar a transação de atualizar tabela")
          });

          function atualizarTabela(tx){
            tx.executeSql("UPDATE memorias SET r_escrita='"+r_escrita+"', r_falada='"+r_falada+"' WHERE id='"+id_res+"'")
          }

          toastSalvar();
          $("#input_rescrita").val('');
          $("#input_rfalada").val('');
          app.popup.close('.popup-resposta');
      })

    }

  },
  function(err){
    app.dialog.alert('Erro ao puxar dados do banco: '+err)
  })
}

listarMemorias();

// gravar pergunta
$("#gravarPergunta").on("click", function() {
  let options = {
    language:"pt-BR",
    showPopup: false,
    showPartial: true
  }
    
  //COMEÇOU A ESCUTAR
  window.plugins.speechRecognition.startListening( //sucesso
  function(dados) {
      $.each(dados, function(index,texto) {
        $("#perguntaEntendida").val(texto);
      })
  },
  function(erro) {
      app.dialog.alert('Houve um erro: '+erro)
  }, options)
});

//salvar pergunta
$("#salvarPergunta").on("click", function() {
  var pergunta_escrita = $("#perguntaEscrita").val();
  var pergunta_falada = $("#perguntaEntendida").val();


  if(pergunta_escrita == "" || pergunta_falada == "") {
    app.dialog.alert('Por favor, preencha todos os campos!');
  } else {
    db.transaction(inserir,
      function(err){
        app.dialog.alert('Erro na transação Inserir: '+err)
      },
      function(){
        app.popup.close('.popup-pergunta');
        listarMemorias();
        toastSalvar();
    
        
      })
  }

  function inserir(tx) {
    tx.executeSql(`INSERT INTO memorias (p_escrita, p_falada) VALUES ('${pergunta_escrita}','${pergunta_falada}')`);
  }

});

// apagar memória
$("#apagarMemoria").on("click", function(){
  app.dialog.confirm('Quer mesmo apagar a memória?','<strong>Confirmação</strong>', function(){
    db.transaction(apagaBanco,
      function(err){
        app.dialog.alert('Erro ao realizar Transação Apagar: '+err)
      },
      function(){
        app.views.main.router.refreshPage();
      })

      function apagaBanco(tx){
        tx.executeSql("DROP TABLE memorias",[],
        function(){
          app.dialog.alert('Quem sou eu? Nada mais faz sentido...','<strong>Memória excluída.</strong>')
        },
        function(err){
          app.dialog.alert('Falha ao apagar memórias: '+err)
        })
      }
  })
})

function toastSalvar(){
  toastSalvar = app.toast.create({
    icon: '<i class="mdi mdi-content-save"></i>',
    text: 'Salvo.',
    position: 'center',
    closeTimeout: 2000,
  });
  toastSalvar.open();
}

