/* @flow */

import { graphql, ObjectTypeComposer } from 'graphql-compose';
import getFieldConfig from '../ObjectParser';

const { GraphQLFloat, GraphQLBoolean } = graphql;

describe('ObjectParser', () => {
  describe('getFieldConfig()', () => {
    it('number', () => {
      expect(getFieldConfig(6)).toBe('Float');
      expect(getFieldConfig(77.7)).toBe('Float');
    });

    it('string', () => {
      expect(getFieldConfig('test')).toBe('String');
    });

    it('boolean', () => {
      expect(getFieldConfig(true)).toBe('Boolean');
      expect(getFieldConfig(false)).toBe('Boolean');
    });

    it('null', () => {
      expect(getFieldConfig(null)).toBe('JSON');
    });

    describe('array', () => {
      it('of number', () => {
        expect(getFieldConfig([1, 2, 3])).toEqual(['Float']);
      });

      it('of string', () => {
        expect(getFieldConfig(['a', 'b', 'c'])).toEqual(['String']);
      });

      it('of boolean', () => {
        expect(getFieldConfig([false, true])).toEqual(['Boolean']);
      });

      it('of object', () => {
        const valueAsArrayOfObjects = [{ a: 123 }, { a: 456 }];
        const type = getFieldConfig(valueAsArrayOfObjects, 'ParentTypeName');
        expect(type).toHaveLength(1);
        expect(type[0].getTypeName()).toBe('ParentTypeName');
      });

      it('of any', () => {
        expect(getFieldConfig([null])).toEqual(['JSON']);
      });
    });

    it('function', () => {
      const valueAsFn = () => 'abracadabra';
      const res = getFieldConfig(valueAsFn);
      expect(res).toBe(valueAsFn);
    });

    describe('object', () => {
      it('return ObjectTypeComposer', () => {
        const tc = getFieldConfig({ a: 1 }, 'MyType');
        expect(tc).toBeInstanceOf(ObjectTypeComposer);
        expect(tc.getTypeName()).toBe('MyType');
      });

      it('creates fields', () => {
        const tc = getFieldConfig({ a: 1, b: true }, 'MyType');
        expect(tc.getFieldNames()).toEqual(['a', 'b']);
        expect(tc.getFieldType('a')).toBe(GraphQLFloat);
        expect(tc.getFieldType('b')).toBe(GraphQLBoolean);
      });

      it('match snapshot', () => {
        const PeopleTC = getFieldConfig(
          {
            name: 'Luke Skywalker',
            height: () => 'Int',
            mass: () => 'Int',
            hair_color: 'blond',
            skin_color: 'fair',
            eye_color: 'blue',
            birth_year: '19BBY',
            gender: 'male',
            homeworld: {
              name: 'Tatooine',
              rotation_period: '23',
              orbital_period: '304',
              terrain: 'desert',
              surface_water: '1',
              population: () => 'Int',
            },
            films: [
              'https://swapi.co/api/films/2/',
              'https://swapi.co/api/films/6/',
              'https://swapi.co/api/films/3/',
            ],
            created: () => 'Date',
            edited: '2014-12-20T21:17:56.891000Z',
          },
          'PeopleType'
        );

        const PeopleGraphQLType = PeopleTC.getType();
        expect(PeopleGraphQLType).toMatchSnapshot();
        expect(PeopleGraphQLType.getFields()).toMatchSnapshot();

        const homeworldSubType = PeopleTC.getFieldType('homeworld');
        expect(homeworldSubType).toMatchSnapshot();
        // $FlowFixMe
        expect(homeworldSubType.getFields()).toMatchSnapshot();
      });
    });
  });
});
