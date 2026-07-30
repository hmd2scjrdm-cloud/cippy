export default function handler(req, res) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const script = `(function(){
  var cs = document.currentScript;
  var siteId = (cs && cs.getAttribute('data-site-id')) || 'web-1';
  var endpoint = (cs ? cs.src : '').replace(/\\/tracker\\.js.*$/, '/collect');
  if (!endpoint) return;

  function uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getId(key, storage){
    try {
      var v = storage.getItem(key);
      if (!v) { v = uuid(); storage.setItem(key, v); }
      return v;
    } catch (e) { return uuid(); }
  }

  var visitorId = getId('cippy_vid', window.localStorage);
  var sessionId = getId('cippy_sid', window.sessionStorage);

  function send(payload){
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(){});
    } catch (e) {}
  }

  send({
    site_id: siteId,
    event_type: 'pageview',
    path: location.pathname + location.search,
    referrer: document.referrer || null,
    visitor_id: visitorId,
    session_id: sessionId
  });

  document.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest('[data-track-conversion]') : null;
    if (!el) return;
    send({
      site_id: siteId,
      event_type: 'conversion',
      path: location.pathname + location.search,
      referrer: document.referrer || null,
      visitor_id: visitorId,
      session_id: sessionId,
      conversion_name: el.getAttribute('data-track-conversion')
    });
  }, true);
})();
`;

  res.status(200).send(script);
}
