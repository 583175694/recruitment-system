import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);
  
  catch(exception: BadRequestException, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus?.() || 400;
      
      // Get the response object from the exception
      const exceptionResponse = exception.getResponse?.() || {};
      const exceptionMessage = (typeof exceptionResponse === 'object') 
        ? (exceptionResponse as any).message 
        : undefined;
      
      // Check if this is a validation error
      if (exceptionMessage && Array.isArray(exceptionMessage)) {
        // Format validation errors
        const validationErrors = {};
        
        exceptionMessage.forEach((error: ValidationError | string) => {
          if (typeof error === 'string') {
            // Handle simple string errors
            if (!validationErrors['general']) {
              validationErrors['general'] = [];
            }
            validationErrors['general'].push(error);
          } else if (error && error.property && error.constraints) {
            // Handle validation errors with constraints
            validationErrors[error.property] = Object.values(error.constraints);
            
            // Handle nested errors
            if (error.children && Array.isArray(error.children) && error.children.length > 0) {
              this.processNestedErrors(error.property, error.children, validationErrors);
            }
          }
        });
        
        return response.status(status).json({
          statusCode: status,
          error: 'Bad Request',
          validationErrors,
          message: '表单验证失败，请检查输入'
        });
      }
      
      // If it's not a validation error, return the original response
      return response.status(status).json(
        typeof exceptionResponse === 'object' 
          ? exceptionResponse 
          : { statusCode: status, message: exceptionResponse }
      );
    } catch (error) {
      // Log the error for debugging
      this.logger.error(`Error in validation filter: ${error.message}`, error.stack);
      
      // Fallback response
      const response = host.switchToHttp().getResponse<Response>();
      return response.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: '请求验证失败'
      });
    }
  }
  
  private processNestedErrors(
    parentProperty: string,
    errors: ValidationError[],
    validationErrors: Record<string, string[]>
  ) {
    if (!Array.isArray(errors)) return;
    
    errors.forEach(error => {
      if (!error || !error.property) return;
      
      const property = `${parentProperty}.${error.property}`;
      
      if (error.constraints) {
        validationErrors[property] = Object.values(error.constraints);
      }
      
      // Recursively process nested errors
      if (error.children && Array.isArray(error.children) && error.children.length > 0) {
        this.processNestedErrors(property, error.children, validationErrors);
      }
    });
  }
} 