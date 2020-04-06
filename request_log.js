addEventListener('fetch', event => {
  event.respondWith(fetchAndLog(event));
})

async function fetchAndLog(event) {
  const response = await fetch(event.request);
  event.waitUntil(logToElk(event.request, response));
  return response;
}

async function logToElk(request, response) {
  var ray  = request.headers.get('cf-ray') || '';
  var id   = ray.slice(0, -4);
  var data = {
    'timestamp':  Date.now(),
    'url':        request.url,
    'referer':    request.referrer,
    'method':     request.method,
    'ray':        ray,
    'ip':         request.headers.get('cf-connecting-ip') || '',
    'host':       request.headers.get('host') || '',
    'ua':         request.headers.get('user-agent') || '',
    'cc':         request.headers.get('Cf-Ipcountry') || '',
    'colo':       request.cf.colo,
    'tlsVersion': request.cf.tlsVersion || '',
    'tlsCipher':  request.cf.tlsCipher || '',
    'status':     response.status,
  };
  
  var url = "https://elk.example.com/weblogs/logs/" + id + "?pipeline=weblogs&pretty"
  await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json',
    })
  })
}