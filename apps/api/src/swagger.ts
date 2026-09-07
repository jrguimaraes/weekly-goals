import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Weekly Goals API')
    .setDescription(
      'API REST para planejamento e acompanhamento de metas semanais com métricas consolidadas e relatórios imutáveis.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Verificação de integridade e conectividade do serviço')
    .addTag('Categories', 'Gerenciamento de categorias de metas')
    .addTag(
      'Weeks',
      'Ciclo de vida de semanas (planejamento, ativação, fechamento e resumo de métricas)',
    )
    .addTag(
      'Goals',
      'Gerenciamento e acompanhamento de progresso de metas semanais',
    )
    .addTag('Reports', 'Consulta de relatórios históricos consolidados e imutáveis')
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): void {
  const document = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, document);
}
