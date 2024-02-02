
/***********************************************************************
 *                           CRUD
 *   Descrição: Todas funções de crud usadas nesse documento
 *   
 ***********************************************************************/

/**
 * Cria o banco chamado "Banco" se não existir. Se existir, abre.
 */
var db = window.openDatabase("Banco","1.0","Banco",25000000);
db.transaction(criarTabela,
  function(err){
    app.dialog.alert('Erro ao criar tabela: '+err);
  },
  function(){
    console.log('Sucesso ao realizar transação Criar Tabela');
  }
  
);

/**
 * Cria tabela memorias
 * @param {*} tx 
 */
function criarTabela(tx){
  tx.executeSql("CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key,pergunta varchar(255),resposta varchar(255))");
}

/**
 * Apaga o banco todo
 */
function apagaBanco(){
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
      app.dialog.alert('Quem sou eu? <br>Nada mais faz sentido...','<strong>Memória excluída.</strong>')
    },
    function(err){
      app.dialog.alert('Falha ao apagar memórias: '+err)
    })
  }
}

/**
 * Insere a pergunta e a resposta na tabela
 * @param {string} pergunta
 * @param {string} resposta
 */
function insereMemoria(pergunta, resposta){
  db.transaction(insereMemoria,
    function(err){
      app.dialog.alert('Erro na transação Inserir: '+err)
    },
    function(){
      app.popup.close('.popup-memoria');
      app.views.main.router.refreshPage();
      tostSalvar();      
    });

    function insereMemoria(tx) {
      tx.executeSql(`INSERT INTO memorias (pergunta, resposta) VALUES ('${pergunta}','${resposta}')`);
    }
}

/**
 * Atualiza a memória
 * @param {string} pergunta 
 * @param {string} resposta
 * @param {string} id 
 */
function atualizaMemoria(pergunta, resposta, id){
  db.transaction(atualizaMemoria,
    function(err){
      app.dialog.alert('Erro ao realizar transação de Atualizar Tabela: '+err)
    },
    function(){
      console.log("Sucesso ao realizar a transação de atualizar tabela")
    });

    function atualizaMemoria(tx){
      var sql = "UPDATE memorias SET pergunta='"+pergunta+"', resposta='"+resposta+"' WHERE id='"+id+"'  "
      tx.executeSql(sql);
    }
}

/**
 * Apaga um registro da tabela de acordo com o id salvo em localStorage
 */
function deletaMemoria(){
  db.transaction(deletaMemoria,
    function(err){
      app.dialog.alert("Erro ao deletar item: "+err)
    },
    function(){
      console.log("Sucesso ao deletar item da tabela")
      app.views.main.router.refreshPage();
    });

    function deletaMemoria(tx) {
      var id = localStorage.getItem('idItem')
      tx.executeSql("DELETE FROM memorias WHERE id='"+id+"'")
    }
}

/**
 * Lista todas as memorias
 */
function listaMemorias(){
  db.transaction(listaMemorias,
    function(err){
      app.dialog.alert('Erro ao realizar transação Selecionar Tudo: '+err)
    },
    function(){
      console.log('Sucesso ao realizar Transação Selecionar Tudo!')
    });

    function listaMemorias(tx){
      tx.executeSql('SELECT * FROM memorias ORDER BY id',[],
      funcaoPrincipal,
      function(err){
        app.dialog.alert('Erro ao puxar dados do banco: '+err)
      })
    } 
}



/********************************************************************************************/


/***********************************************************************
 *                          DIVERSAS
 *   Descrição: Todas funções diversas usadas nesse documento
 *   
 ***********************************************************************/

/**
 * Função para asssistente falar
 * @param {string} fala - Texto para ela falar
 * @returns - Retorna som 
 */
function assistenteFala(fala){
  TTS.speak({
    text: fala,
    locale: 'pt-BR',
    rate: 1
  }, function () {            
      console.log("Assistente falou!")
  }, function (erro) {        
      app.dialog.alert('Houve um erro: '+erro)
  });
}

/**
 * Modal de ação realizada com sucesso.
 */
function tostSalvar(){
  toastSalvar = app.toast.create({
    icon: '<i class="mdi mdi-content-save"></i>',
    text: 'Salvo.',
    position: 'center',
    closeTimeout: 2000,
  });
  toastSalvar.open();
}

/***********************************************************************
 *                              AÇÕES
 *   Descrição: Todas ações realizadas através de algum evento
 *   
 ***********************************************************************/

// Gravar Pergunta
$("#gravarPergunta").on("click", function() {
  let options = {
    language:"pt-BR",
    showPopup: false,
    showPartial: true
  }
    
  window.plugins.speechRecognition.startListening(
  function(dados) {
      $.each(dados, function(index,texto) {
        $("#pergunta").val(texto);
      })
  },
  function(erro) {
      app.dialog.alert('Houve um erro: '+erro)
  }, options)
});

// Gravar Resposta
$("#gravarResposta").on("click", function() {
  let options = {
    language:"pt-BR",
    showPopup: false,
    showPartial: true
  }
    
  window.plugins.speechRecognition.startListening(
  function(dados) {
      $.each(dados, function(index,texto) {
        $("#resposta").val(texto);
      })
  },
  function(erro) {
      app.dialog.alert('Houve um erro: '+erro)
  }, options)
});

// Salvar memória
$("#salvarMemoria").on("click", function() {
  var pergunta = $("#pergunta").val();
  var resposta = $("#resposta").val();

  if(pergunta == "" || resposta == "") {
    app.dialog.alert('Por favor, preencha todos os campos!');
  } else {
    insereMemoria(pergunta, resposta)
  }
});

// Atualizar memória
$("#atualizarMemoria").on("click", function() {
  var pergunta = $("#pergunta").val();
  var resposta = $("#resposta").val();
  var id = localStorage.getItem('idItem');

  atualizaMemoria(pergunta, resposta, id);

  tostSalvar();

  $("#pergunta").val('');
  $("#resposta").val(''); 

  app.popup.close('.popup-memoria');
  app.views.main.router.refreshPage();
  
});


// Apagar memória
$("#apagarMemoria").on("click", function(){
  app.dialog.confirm('Quer mesmo apagar a memória?','<strong>Confirmação</strong>', function(){
    apagaBanco();
  })
})

// limpar inputs de perguntas
$("#add2").on("click", function(){
  $("#pergunta").val("");
  $("#resposta").val("");
});

// searchbar
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

// Ouvir Pergunta
$("#ouvirPergunta").on('click', function(){
  var fala = $("#pergunta").val();
  assistenteFala(fala)
});

// Ouvir Resposta
$("#ouvirResposta").on('click', function(){
  var fala = $("#resposta").val();
  assistenteFala(fala)
});

/***********************************************************************
 *                         FUNÇÃO PRINCIPAL
 *   Descrição: Lista todas as mémórias atualizadas na página de acordo
 *              com as ações do usuário
 *   
 ***********************************************************************/
function funcaoPrincipal(tx, dados){
  var linhas = dados.rows.length;

  if(linhas == 0){
    $("#comMemorias").addClass("display-none");
    $("#semMemorias").removeClass("display-none");
  } else {
    $("#comMemorias").removeClass("display-none");
    $("#semMemorias").addClass("display-none");

    $("#quantidade").html(linhas);
    $("#listaPerguntas").empty();

    var banco = [];

    for (let i = 0; i < linhas; i++) {
      // adicionando todos os dados num array
      banco.push({
        pergunta: dados.rows.item(i).pergunta,
        resposta: dados.rows.item(i).resposta
      })
      // salvando no localStorage
      localStorage.setItem('banco',JSON.stringify(banco));

      $("#listaPerguntas").append(`
      <div data-id="${dados.rows.item(i).id}"
           data-pergunta="${dados.rows.item(i).pergunta}"
           data-resposta="${dados.rows.item(i).resposta}"
           class="item-tela-memoria list media-list list-outline-ios list-strong-ios list-dividers-ios margin-left margin-right"
       >
        <ul>
          <li>
            <a class="item-link item-content popup-open" data-popup=".popup-memoria">
              <div class="item-inner">
                <div class="item-title-row">
                  <div class="item-title txt-white"><i class="mdi mdi-pencil"></i> ${dados.rows.item(i).pergunta}</div>
                  <div class="item-after">
                    <span class="badge padding-left padding-right ">ID: ${dados.rows.item(i).id}</span>
                  </div>
                </div>
                <div class="item-title" txt-white><i class="mdi mdi-microphone"></i> ${dados.rows.item(i).resposta}</div>
              </div>
            </a>
          </li>
        </ul>
      </div>
      `)
    }

    $(".item-tela-memoria").on('click', function(){
      var id = $(this).attr('data-id');
      localStorage.setItem('idItem',id);

      var pergunta = $(this).attr('data-pergunta');
      var resposta = $(this).attr('data-resposta');

      $("#fabSalvar").addClass('display-none');
      $("#fabAtualizar").removeClass('display-none');

      // alimentando os campos do popup
      $("#pergunta").val(pergunta);
      $("#resposta").val(resposta);

      $("titulo-popup").val("Editar memória");

      // abrir o pop de pergunta
      app.popup.open('.popup-memoria');


    });

    // clicou e segurou o clique
    $(".item-tela-memoria").on('taphold', function(){
     
      var id = $(this).attr('data-id');
      localStorage.setItem('idItem',id);
      var pergunta = $(this).attr('data-pergunta');
      var resposta = $(this).attr('data-resposta');

      app.dialog.create({
        title: 'OPÇÕES',
        text: 'Escolha uma das opções abaixo:',
        buttons: [
          {
            text: '<i class="mdi mdi-delete"></i> Deletar',
            color: 'red',
            onClick: function(){
              app.dialog.confirm("Tem certeza que quer deletar a memória? <br><strong>ID: "+id+"</strong><br><strong>Pergunta: "+pergunta+"<br>Resposta: "+resposta+"</strong>", 'CONFIRMAÇÃO',function(){
                deletaMemoria()
              })
            }
          },
          {
            text: ' Cancelar',
            color: 'black',
            onClick: function(){

            }
          }
        ],
        verticalButtons: true
      }).open()
      
    });


  }

}

listaMemorias();



