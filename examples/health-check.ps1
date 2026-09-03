$response = Invoke-RestMethod -Uri 'http://127.0.0.1:4141/healthz'
if ($response.status -ne 'ok') {
    throw 'Agent health check failed'
}
Write-Output 'Agent is healthy'
