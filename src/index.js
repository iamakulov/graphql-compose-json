/* @flow */

import getFieldConfig from './ObjectParser';

const composeWithJson = (name: string, json: any) => getFieldConfig(json, name);

export default composeWithJson;
export { composeWithJson };
