import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();
    const type = context.getType<GqlContextType>();

    if (type !== 'graphql') {
      return next.handle();
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext().req;
    const body = req?.body;

    const operation = body?.operationName ?? 'Anonymous';
    const query = body?.query?.replace(/\s+/g, ' ').slice(0, 120);
    const variables = body?.variables ?? {};

    /** REQUEST LOG */
    this.logger.log(
      `➡️  ${operation}\n` + `📥 Query: ${query}\n` + `📦 Variables: ${JSON.stringify(variables)}`,
    );

    return next.handle().pipe(
      tap((response) => {
        const time = Date.now() - startedAt;

        this.logger.log(
          `✅ ${operation} completed in ${time}ms\n \n` +
            `📤 Response: ${this.safeStringify(response)}\n \n`,
        );
      }),
      catchError((err) => {
        const time = Date.now() - startedAt;

        this.logger.error(
          `❌ ${operation} failed in ${time}ms\n` + `💥 Error: ${err.message}`,
          err.stack,
        );

        throw err;
      }),
    );
  }

  private safeStringify(data: any): string {
    return JSON.stringify(data, null, 2).slice(0, 500);
  }
}
