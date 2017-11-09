/*
function validate(value, rules) {

}
*/
(function FormValidator (exports, module, define) {
  var self = this;

  var form = null;

  var items = {};

  var formElement = null;
// "focusin.validator focusout.validator keyup.validator"
  /*
  var elementsQuery = "[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
    "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
    "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
    "[type='radio'], [type='checkbox'], [type='button']";
*/
  var elementsQuery = "[type='text'], [type='password'], [type='file'], textarea, [type='number'], [type='search'], " +
    "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
    "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color']";
// :text,
// [contenteditable],
    // .on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

  var onChangeAnyElement;

  var extraValidate;

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

  function checkElementRaw(el) {
    var elementName = el.getAttribute('name');
    var elementType = el.getAttribute('type');
    var isValid = true;
    var message = '';
    if (items[ elementName ]) {
      if (elementType == 'checkbox'){
        if (items[ elementName ].presence){
          var checked = el.getAttribute('checked');
          if (!el.checked){
            isValid = false;
            if (items[ elementName ].message) {
              message = items[ elementName ].message;
            } else {
              message = ' is required';
            }
          }
        }
      } else {
        var validateError = validate.single(el.value, items[elementName]);
        if (validateError){
          isValid = false;
          message = Array.isArray(validateError) ? validateError[0] : 'is not valid'
        }
      }
    }
    return {isValid: isValid, message: message};
  }

  function checkElement(e){
//        e.preventDefault();
    var res = checkElementRaw(e.target);
    markElement(e.target, res.isValid, res.message);

    if (onChangeAnyElement){
      onChangeAnyElement(e, res.isValid, res.message)
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

    extraValidate = data.extraValidate || null;

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
    document.querySelectorAll("[type='radio'], [type='checkbox']").forEach(function(item){
      item.addEventListener('click', checkElement, true);
    });
    document.querySelectorAll("select").forEach(function(item){
      item.addEventListener('change', checkElement, true);
    });

  },

  this.validateForm = function (params){
    if (!params) {
      params = {};
    }
    params = Object.assign({},
      {checkNotValidated: false, markValidated: false, ignore: []},
      params
    );

    var isValid = true;
    formElement.querySelectorAll(elementsQuery).forEach(function(el){
      var elementName = el.getAttribute('name');
      if (Array.isArray(params.ignore) && params.ignore.indexOf(elementName) > -1){
        return;
      }
      var elementValidated = el.getAttribute('validated');
      var isValidElement = true;
      var res = checkElementRaw(el);
      if (!res.isValid){
        isValid = false;
        isValidElement = false;
      }
      if (params.checkNotValidated || elementValidated){
        el.setAttribute('validated', true);
        el.setAttribute('valid', isValidElement);
        if (params.markValidated) {
          markElement(el, res.isValid, res.message);
        }
      }
    });
    if (typeof extraValidate == 'function'){
      if (!extraValidate()){
        isValid = false;
      }
    }

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
