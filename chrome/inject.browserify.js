window.browserpassFillForm = function(login, autoSubmit) {
  const USERNAME_FIELDS =
    "input[id*=user i], input[id*=login i], input[id*=email i], input[type=email i], input[type=text i]";
  const PASSWORD_FIELDS = "input[type=password i]";

  function queryAllVisible(parent, selector, form) {
    var result = [];
    var selectors = selector.split(",");
    for (var i = 0; i < selectors.length; i++) {
      var selector = selectors[i].trim();
      var elems = parent.querySelectorAll(selector);
      for (var j = 0; j < elems.length; j++) {
        // Elem or its parent has a style 'display: none',
        // or it is just too narrow to be a real field (a trap for spammers?).
        if (elems[j].offsetWidth < 50 || elems[j].offsetHeight < 10) {
          continue;
        }
        // Select only elements from specified form
        if (form && form != elems[j].form) {
          continue;
        }
        // Elem takes space on the screen, but it or its parent is hidden with a visibility style.
        var style = window.getComputedStyle(elems[j]);
        if (style.visibility == "hidden") {
          continue;
        }
        // Elem is outside of the boundaries of the visible viewport.
        var rect = elems[j].getBoundingClientRect();
        if (
          rect.x + rect.width < 0 ||
          rect.y + rect.height < 0 ||
          (rect.x > window.innerWidth || rect.y > window.innerHeight)
        ) {
          continue;
        }
        // This element is visible, will use it.
        result.push(elems[j]);
      }
    }
    return result;
  }

  function queryFirstVisible(parent, selector, form) {
    var elems = queryAllVisible(parent, selector, form);
    return elems.length > 0 ? elems[0] : undefined;
  }

  function form() {
    var field = queryFirstVisible(
      document,
      PASSWORD_FIELDS + ", " + USERNAME_FIELDS,
      undefined
    );
    return field && field.form ? field.form : undefined;
  }

  function field(selector) {
    return queryFirstVisible(document, selector, form());
  }

  function update(selector, value) {
    if (!value.length) {
      return false;
    }

    // Focus the input element first
    var el = field(selector);
    if (!el) {
      return false;
    }
    var eventNames = ["click", "focus"];
    eventNames.forEach(function(eventName) {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    });

    // Focus may have triggered unvealing a true input, find it again
    el = field(selector);
    if (!el) {
      return false;
    }

    // Now set the value and unfocus
    el.setAttribute("value", value);
    el.value = value;
    var eventNames = [
      "keypress",
      "keydown",
      "keyup",
      "input",
      "blur",
      "change"
    ];
    eventNames.forEach(function(eventName) {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    });
    return true;
  }

  update(USERNAME_FIELDS, login.u);
  update(PASSWORD_FIELDS, login.p);

  if (login.digits) {
    alert((login.label || "OTP") + ": " + login.digits);
  }

  var password_inputs = queryAllVisible(document, PASSWORD_FIELDS, form());
  if (password_inputs.length > 1) {
    // There is likely a field asking for OTP code, so do not submit form just yet
    password_inputs[1].select();
  } else {
    window.requestAnimationFrame(function() {
      // Try to submit the form, or focus on the submit button (based on user settings)
      var submit = field("[type=submit]");
      if (submit) {
        if (autoSubmit == "false") {
          submit.focus();
        } else {
          submit.click();
        }
      } else {
        // There is no submit button. We need to keep focus somewhere within the form, so that Enter hopefully submits the form.
        var password = field(PASSWORD_FIELDS);
        if (password) {
          password.focus();
        } else {
          var username = field(USERNAME_FIELDS);
          if (username) {
            username.focus();
          }
        }
      }
    });
  }
};
