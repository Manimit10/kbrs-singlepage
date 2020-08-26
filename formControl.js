// const check = document.getElementById('form');
// if (check) {
//   check.addEventListener('click', (e) => {
//     e.preventDefault();
//     console.log('hi');
//     //   e.preventDefault();
//     //   const options = document.querySelectorAll('input[name="options]:checked"');
//     //   console.log(options);
//   });
// }
const resultList = document.getElementById('result');

new URLSearchParams(window.location.search).forEach((value, name) => {
  resultList.append(`${name}: ${value}`);
  resultList.append(document.createElement('br'));
});

$(document).ready(function () {
  $('.btn-group').on('click', 'label.btn', function (e) {
    if ($(this).hasClass('active')) {
      setTimeout(
        function () {
          $(this).removeClass('active').find('input').prop('checked', false);
        }.bind(this),
        10
      );
    }
  });
});
