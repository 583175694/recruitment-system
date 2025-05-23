import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * 自定义验证器：检查荣誉成就数据的一致性
 * 如果提供了任何荣誉成就的字段，则其他必需字段也应提供
 */
export function IsConsistentAchievement(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isConsistentAchievement',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 如果值为空或不是数组，则跳过验证
          if (!value || !Array.isArray(value)) {
            return true;
          }

          // 检查数组中的每个元素
          for (const achievement of value) {
            // 检查是否有任何非描述字段被填写（描述是可选的）
            const hasAnyField = achievement.name || 
                               achievement.level || 
                               achievement.awardDate || 
                               achievement.certificateImage;
            
            // 如果提供了任何字段，检查是否所有必需字段都已提供
            if (hasAnyField) {
              const hasAllRequiredFields = achievement.name && 
                                         achievement.level && 
                                         achievement.awardDate && 
                                         achievement.certificateImage;
              
              if (!hasAllRequiredFields) {
                return false;
              }
            }
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return '如果提供了荣誉成就信息，请确保填写所有必需的字段（名称、级别、日期和证书照片）';
        },
      },
    });
  };
} 