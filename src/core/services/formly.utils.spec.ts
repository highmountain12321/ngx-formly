import { FormlyUtils } from './formly.utils';
import { FormlyFieldConfig } from '../components/formly.field.config';

describe('FormlyUtils service', () => {
  let config: FormlyUtils;
  beforeEach(() => {
    config = new FormlyUtils();
  });

  describe('reverseDeepMerge', () => {
    it('should properly reverse deep merge', () => {
      let foo = {foo: 'bar', obj: {}};
      let bar = {foo: 'foo', foobar: 'foobar', fun: () => console.log('demo'), obj: {}};
      config.reverseDeepMerge(foo, bar);

      expect(foo['foo']).toEqual('bar');
      expect(foo['foobar']).toEqual('foobar');
    });
  });

  describe('assignModelValue', () => {
    it('should properly assign model value', () => {
      let model = {};
      config.assignModelValue(model, 'path.to.save', 2);
      expect(model['path']['to']['save']).toBe(2);
    });
  });

  describe('getFieldId', () => {
    it('should properly get the field id if id is set in options', () => {
      let options: FormlyFieldConfig = {id: '1'};
      let id = config.getFieldId('formly_1', options, 2);
      expect(id).toBe('1');
    });

    it('should properly get the field id if id is not set in options', () => {
      let options: FormlyFieldConfig = {type: 'input', key: 'email'};
      let id = config.getFieldId('formly_1', options, 2);
      expect(id).toBe('formly_1_input_email_2');
    });
  });
});
