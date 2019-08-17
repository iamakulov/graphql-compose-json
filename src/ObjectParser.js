/* @flow */

import {
  ObjectTypeComposer,
  upperFirst,
  type ObjectTypeComposerFieldConfigDefinition,
} from 'graphql-compose';

const getFieldConfig = (
  value: any,
  typeName: string
): ObjectTypeComposerFieldConfigDefinition<any, any> => {
  const typeOf = typeof value;

  if (typeOf === 'number') return 'Float';
  if (typeOf === 'string') return 'String';
  if (typeOf === 'boolean') return 'Boolean';

  if (typeOf === 'object') {
    if (value === null) return 'JSON';

    if (Array.isArray(value)) {
      if (Array.isArray(value[0])) return ['JSON'];

      const val =
        typeof value[0] === 'object' && value[0] !== null ? Object.assign({}, ...value) : value[0];

      return [(getFieldConfig(val, typeName): any)];
    }

    const tc = ObjectTypeComposer.createTemp(typeName);
    Object.keys(value).forEach(fieldName => {
      const fieldConfig = getFieldConfig(value[fieldName], `${typeName}_${upperFirst(fieldName)}`);
      tc.setField(fieldName, fieldConfig);
    });

    return tc;
  }

  if (typeOf === 'function') {
    return value;
  }
  return 'JSON';
};

export default getFieldConfig;
