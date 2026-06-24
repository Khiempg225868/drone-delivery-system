export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    if (req.path === "/metrics") {
      return;
    }

    console.log(JSON.stringify({
      event: "http_request",
      service: "auth-service",
      request_path: req.originalUrl || req.url,
      http_method: req.method,
      response_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
    }));
  });

  next();
}
