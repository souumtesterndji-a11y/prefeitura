let pagina = ''
$(document).ready(function() {
  atualiza();
});

function atualiza() {
  $.get('/who-is-online/online.php?pagina='+pagina,
    function(resultado) {
    });

  setTimeout('atualiza()', 2550);
}
