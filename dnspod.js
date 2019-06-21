$httpClient.get('http://119.29.29.29/d?dn=' + $domain + '&ip=1.1.1.1', function(error, response, data){
  if (error) {
    $done({}); // Fallback to standard DND query
  } else {
    $done({addresses: data.split(';'), ttl: 600});
  }
});
