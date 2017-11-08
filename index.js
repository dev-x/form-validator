/*
function validate(value, rules) {

}
*/
(function FormValidator () {
  var self = this;

  var form = null;

  var items = {};

  var formElement = null;
// "focusin.validator focusout.validator keyup.validator"
  var elementsQuery = "[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
    "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
    "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
    "[type='radio'], [type='checkbox'], [type='button']";
// :text,
// [contenteditable],
    // .on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

  var onChangeAnyElement;

  var successClass = 'success';
  var errorClass = 'error';
  var errorMessageClass = 'error_message';

  function markElement(el, isValidElement, message){
    if (!isValidElement) {
      // https://developer.mozilla.org/ru/docs/Web/API/Element/classList
      /*
        Особенность 	   Chrome 	Firefox (Gecko) 	Internet Explorer 	Opera 	Safari (WebKit)
        Basic support 	 8.0 	    3.6 (1.9.2) 	    10                  11.50 	5.1 (Баг WebKit 20709)
        toggle method's  24 	    24 (24) 	        not supported 	    15 	    yes (Баг WebKit 99375)
        second argument
      */

      el.parentNode.classList.remove(successClass);
      el.parentNode.classList.add(errorClass);
      if (el.parentNode.querySelector("."+errorMessageClass)){
        el.parentNode.querySelector("."+errorMessageClass).innerHTML = message;
      }
    } else {
      el.parentNode.classList.remove("error");
      el.parentNode.classList.add("success");
    }

  }

  function checkElement(e){
//        e.preventDefault();
    var elementName = e.target.getAttribute('name');
    if (items[ elementName ]) {
      var validateError = validate.single(e.target.value, items[elementName]);
      markElement(e.target, !validateError, Array.isArray(validateError) ? validateError[0] : '');
    }
    if (onChangeAnyElement){
      onChangeAnyElement(e.target, !validateError)
    }

  }
  // focusout.validator keyup.validator

  this.init = function (data){
    form = data.form;
    items = data.items;

    onChangeAnyElement = data.onChangeAnyElement;

    successClass      = data.successClass || 'success';
    errorClass        = data.errorClass || 'error';
    errorMessageClass = data.errorMessageClass || 'error_message';

    elements = {

    };

    formElement = document.getElementById( form );
    formElement.addEventListener('submit', function(e) {
      e.preventDefault();
      // e.stopPropagation();
    }, true);
    document.querySelectorAll(elementsQuery).forEach(function(item){
      item.addEventListener('focusout', checkElement, true);
      item.addEventListener('keyup', checkElement, true);
    });

  },

  this.validateForm = function (params){
    if (!params) {
      params = {};
    }
    params = Object.assign({},
      {checkNotValidated: false, markValidated: false},
      params
    );

    var isValid = true;
    formElement.querySelectorAll(elementsQuery).forEach(function(el){
      var elementName = el.getAttribute('name');
      var elementValidated = el.getAttribute('validated');
      var isValidElement = true;
      var validateError;
      if (items[ elementName ]){
        validateError = validate.single(el.value, items[ elementName ]);
        if (validateError) {
          isValid = false;
          isValidElement = false;
        }
      }
      if (params.checkNotValidated || elementValidated){
        el.setAttribute('validated', true);
        el.setAttribute('valid', isValidElement);
        if (params.markValidated) {
          markElement(el, !validateError, Array.isArray(validateError) ? validateError[0] : '');
        }
      }
    });

    return isValid;
  };

  this.validateFormReset = function (){

    formElement.querySelectorAll(elementsQuery).forEach(function(el) {
      el.setAttribute('validated', false);
      el.removeAttribute('valid');
      el.parentNode.classList.remove("error");
      el.parentNode.classList.remove("success");
    });

  };

  window.validator = this;
})();