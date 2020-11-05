log_sent_index = 0;
event_log_array = [];
page_loaded_timestamp = 0;
form_submit_only_last = true;
sendInterval = null;
socket_log_interval_ms = 8000;

recPyramid_init_log_interval_ms = 500;

log_session_id = Math.round(Math.random() * 1000000000);

var recPyramid_init_log_interval = setInterval(recPyramid_init_log, recPyramid_init_log_interval_ms);

function recPyramid_init_log() {
  clearInterval(recPyramid_init_log_interval);

  sendInterval = setInterval(send_log, socket_log_interval_ms);
}

$(function () {
  $(document).on('click', '*', function (e) {
    if (e.toElement == e.currentTarget) {
      var element_data = getElementData(e);

      add_event_log(element_data);
    }
  });
  // In recPyramid We do not have drop activity
  // $(document).on('drop', '*', function(e) {
  //     if(e.toElement == e.currentTarget) {
  //         var element_data = getElementData(e);

  //         add_event_log(element_data);
  //     }
  // });
  // In recPyramid we do not have drag
  // $(document).on('dragstart', '*', function(e) {
  //     if(e.toElement == e.currentTarget) {
  //         var element_data = getElementData(e);

  //         add_event_log(element_data);
  //     }
  // });

  $(document).on('change', 'input, select', function (e) {
    var element_data = getElementData(e);

    element_data.input_text = e.currentTarget.value;
    element_data.timestamp = e.timeStamp;

    add_event_log(element_data);
  });

  page_loaded_log();

  recPyramid_init_log();
});

function page_loaded_log() {
  var even_log = {};

  even_log.type = 'page_loaded';
  even_log.timestamp = Date.now();
  page_loaded_timestamp = Date.now();

  add_event_log(even_log);
}

/*
$(window).unload(function(){
    send_log();
});
*/

/*
window.onbeforeunload = function(){
    send_log();
};
*/

function get_log_not_send_slice() {
  var end_index = event_log_array.length;
  var log_slice = event_log_array.slice(log_sent_index, end_index);
  log_sent_index = end_index;

  return log_slice;
}

function send_log() {
  var log_slice = get_log_not_send_slice();

  //send
  if (log_slice.length > 0) {
    $.ajax({
      url:
        baseurl +
        'action/lds/edcrumble/log_activity?log_session_id=' +
        log_session_id +
        '&guid=' +
        $('#lds_edit_guid').val() +
        '&revision=' +
        $('#lds_edit_revision').val(),
      method: 'POST',
      data: JSON.stringify(log_slice),
      processData: false,
      contentType: 'application/json',
    });
  }
}

function add_event_log(event) {
  event['guid'] = $('#lds_edit_guid').val();
  event['revision'] = $('#lds_edit_revision').val();
  var original_design = saveData(true);

  var cloned_resourcesList = { ...original_design['resourcesList'] };

  for ([key, item] of Object.entries(cloned_resourcesList)) {
    var cloned_resource = { ...item };

    var cloned_content = { ...cloned_resource['content'] };

    if (typeof cloned_content === 'object') cloned_content['data'] = null;

    cloned_resource['content'] = cloned_content;

    cloned_resourcesList[key] = cloned_resource;
  }

  original_design['resourcesList'] = cloned_resourcesList;

  event['design'] = $.extend(true, {}, original_design);

  event.page_loaded_timestamp = page_loaded_timestamp;
  if (typeof event.timestamp === 'undefined') event.timestamp = Date.now();

  event_log_array.push(event);
}

function log_custom_event(type, properties) {
  var event_log = {};

  event_log.type = type;
  event_log.timestamp = Date.now();

  event_log = $.extend(event_log, properties);

  add_event_log(event_log);
}

function getElementData(e) {
  var event_log = {};
  var element = e.currentTarget;
  event_log.properties = getElementProperties(element);
  event_log.path = getElementPath(element);
  event_log.type = e.type;
  event_log.x = e.pageX;
  event_log.y = e.pageY;
  event_log.window_size = {};
  event_log.window_size.x = $(window).width();
  event_log.window_size.y = $(window).height();

  return event_log;
}

function getElementProperties(e) {
  var properties = {};
  var element = e;

  properties.tag = element.localName;
  properties.attributes = {};
  for (var i = 0; i < element.attributes.length; i++) {
    properties.attributes[element.attributes[i].nodeName] = element.attributes[i].value;
  }
  //even_log.URL = element.baseURI;

  return properties;
}

function getElementPath(e) {
  var path = [];

  while (e.tagName !== 'HTML') {
    path.push(getElementProperties(e.parentElement));
    e = e.parentElement;
  }

  return path;
}
