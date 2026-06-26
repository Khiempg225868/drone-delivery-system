import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const zipkinEndpoint = process.env.OTEL_EXPORTER_ZIPKIN_ENDPOINT
  || "http://jaeger-collector.tracing.svc.cluster.local:9411/api/v2/spans";

if (process.env.OTEL_SDK_DISABLED !== "true") {
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "notification-service",
    }),
    spanProcessors: [
      new BatchSpanProcessor(new ZipkinExporter({
        url: zipkinEndpoint,
      })),
    ],
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongooseInstrumentation(),
    ],
  });

  process.on("SIGTERM", () => {
    provider.shutdown()
      .catch((error) => console.error("Error shutting down tracing", error))
      .finally(() => process.exit(0));
  });
}
