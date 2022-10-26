xport interface ISchema {
  [Key: string]:  schemaProp
}

type schemaProp = {
  type: schmeValueType
  required?: [boolean, string]
  default?: schmeValueType
  minLength?: [number, string]
  maxLength?: [number, string]
  min?: [number, string]
  max?: [number, string]
  validate?: [(v: string) => boolean, string];
}

type schmeValueType = String |  Number | Boolean | Object | Array<any> | null
