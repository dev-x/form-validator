(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['validate.js'], function (validate) {
          return (root.FormValidator = factory(validate));
      });
  } else if (typeof module === 'object' && module.exports) {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory(require('validate.js'));
  } else {
      // Browser globals
      root.FormValidator = factory(root.validate);
  }
}(typeof self !== 'undefined' ? self : this, function (validate) {

  return function FormValidator () {
    var _self = this;

    var form = null;

    var items = {};

    var onlyDefinedElements = false;

    var formElement = null;

    var elements
  // "focusin.validator focusout.validator keyup.validator"
    /*
    var elementsQuery = "[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
      "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
      "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
      "[type='radio'], [type='checkbox'], [type='button']";
  */
    var elementsQueryArray = [
      "[type='text']",
      "[type='password']",
      "[type='file']",
      "[type='number']",
      "[type='search']",
      "[type='tel']",
      "[type='url']",
      "[type='email']",
      "[type='datetime']",
      "[type='date']",
      "[type='month']",
      "[type='week']",
      "[type='time']",
      "[type='datetime-local']",
      "[type='range']",
      "[type='color']",
      "textarea",
    ];
    var elementsQuery = elementsQueryArray.join(', ');
  // :text,
  // [contenteditable],
      // .on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );
    var elementsQueryForValidating = elementsQuery + ", [type='hidden'], [type='checkbox'], select ";

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
            if (!el.checked){
              isValid = false;
              if (items[ elementName ].presence.message) {
                message = items[ elementName ].presence.message;
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

    this.initElement = function (el, type) {
      if (!el) {
        return;
      }
      if (onlyDefinedElements){
        if (!items.hasOwnProperty(el.name)){
          return;
        }
      }
      switch (type) {
      case 'select':
        el.addEventListener('change', checkElement, true);
        break;
      case 'checkbox':
        el.addEventListener('click', checkElement, true);
      case 'radio':
        break;
      default:
        el.addEventListener('focusout', checkElement, true);
        el.addEventListener('input', checkElement, true);
//        el.addEventListener('keyup', checkElement, true);
      }
    }

    this.init = function (data){
      form = data.form;
      items = data.items;

      onlyDefinedElements = data.onlyDefinedElements;

      onChangeAnyElement = data.onChangeAnyElement;

      successClass      = data.successClass || 'success';
      errorClass        = data.errorClass || 'error';
      errorMessageClass = data.errorMessageClass || 'error_message';

      extraValidate = data.extraValidate || null;

      elements = {

      };

      formElement = document.getElementById( form );
      if (!formElement){
        return;
      }
      /*
      formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        // e.stopPropagation();
      }, true);
      */
      formElement.querySelectorAll(elementsQuery).forEach(function(item){
        _self.initElement(item, '');
      });
      formElement.querySelectorAll("[type='radio'], [type='checkbox']").forEach(function(item){
        _self.initElement(item, 'checkbox');
      });
      formElement.querySelectorAll("select").forEach(function(item){
        _self.initElement(item, 'select');
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
      formElement.querySelectorAll(elementsQueryForValidating).forEach(function(el){
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

      formElement.querySelectorAll(elementsQueryForValidating).forEach(function(el) {
        el.setAttribute('validated', false);
        el.removeAttribute('valid');
        el.parentNode.classList.remove("error");
        el.parentNode.classList.remove("success");
      });

    };

  }
}));
