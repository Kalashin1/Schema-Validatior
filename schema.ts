import { ISchema } from "./types";
import { ArrayEquals } from "./bootstrap";

const SchemaObj:ISchema = {
  name: {
    type: String,
    maxLength: [50, 'Exceeded the max length'],
    minLength: [5, 'Less than the min length for the value']
  },
  age: {
    type: Number,
    min: [5, 'Lowest possible value is 5'],
    max: [25, 'Highest possible value is 10']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    validate: [
      (v: string) => Validators.isEmail.test(v),
      'Invalid email'
    ]
  },
  isAdult: {
    type: Boolean
  },
  hobbies: {
    type: Array
  },
  socials: {
    type: Object
  },
  height: {
    type: Number,
    default: 10
  },
  gender: {
    type: String,
    required: [true, "Provide a gender"]
  }
}



const doc = {
  name: 'Kinanee',
  age: 20,
  // isAdult: true,
  email: 'kinaneesamsonjohn@gmail.com',
  hobbies: ["singing"],
  socials: {
    "youtube": "link",
    "facebook": "link"
  },
  gender: 'M',
}

export class Schema {
  constructor(readonly schema: ISchema) { }

  validateObj<T>(doc: any): [T,boolean] {
    // obtain an array of the keys on the schema
    const keys = Object.keys(this.schema);

    // create an empty object we will populate with fields that passes the test
    let document: Record<string, any> = {
    }

    // check for properties that have a default value 
    for (const key in this.schema) {
      if (Object.prototype.hasOwnProperty.call(this.schema, key)) {
        const element: typeof this.schema[typeof key] = this.schema[key];
        // if they don't define a value for the required property
        // set it to the one defined on the schema 
        if (typeof element.default !== 'undefined' && !(doc[key])) {
          document[key] = element.default
          doc[key] = element.default
        } else {
          continue;
        }
      }
    }

    // obtain the keys defined on the object
    const _K = Object.keys(doc);

    // check if a property is defined on the schema but not on the object
    const [, notAmong] = ArrayEquals(keys.sort(), _K.sort())
    // console.log(notAmong)
    for (const key in doc) {
      if (!this.schema[key]) {
        continue;
      } 
      else if (
        // the key exits in the document
        Object.prototype.hasOwnProperty.call(doc, key) &&
        // and not among is false, that is there is a complete match
        // between the key keys on the object and the keys on the schema 
        // bool &&
        // check if the constructor of the value matches the constructor
        // type defined on the type property on the schema 
        (doc[key]).constructor == this.schema[key].type
      ) {

        if (
          // check if the constructor is a string
          (doc[key]).constructor === String &&
          // check if the min length property is defined
          this.schema[key].minLength &&
          // check the length of the string is less 
          // than the value for the min length for the property
          (doc[key].length < this.schema[key].minLength![0])
        ) {

          throw Error(this.schema[key].minLength![1]);
        }

        if (
          // check if the constructor is a string
          (doc[key]).constructor === String &&
          // check if the max length property is defined
          this.schema[key].maxLength &&
          // check the length of the string is greater 
          // than the value for the max length for the property
          (doc[key].length > this.schema[key].maxLength![0])
        ) {
          throw console.error(this.schema[key].maxLength![1]);
        }

        if (
          // check the constructor is a number
          (doc[key]).constructor === Number &&
          // check if the min property is defined
          this.schema[key].max &&
          // checking the value is less than 
          // the minimum for the property
          (doc[key]) < this.schema[key].min![0]
        ) {
          throw Error(this.schema[key].min![1]);
        }

        if (
          // check the constructor is a number
          (doc[key]).constructor === Number &&
          // check if the max property is defined
          this.schema[key].max &&
          // checking the value is greater than 
          // the minimum for the property
          (doc[key]) > this.schema[key].max![0]
        ) {
          throw Error(this.schema[key].max![1])
        }

        // checking for RegExp for a if valiate is defined
        if (
          (doc[key]).constructor === String &&
          this.schema[key].validate &&
          !this.schema[key].validate![0](doc[key])
        ) {
          throw Error(this.schema[key].validate![1])
        }

        document[key] = doc[key]
        // console.log(this.schema[key].required)
        // if theres isnt a match between the constructor for a particular key
        // throw an error;
      } else if (this.schema[key] && this.schema[key].type !== (doc[key]).constructor) {
        throw Error(`Value is of invalid type for ${keys.find(k => k == key)}`)
      }
      else {
        let i = 0
        for (i; i < notAmong.length; i++) {
          // for every property key required on the schema, 
          // that isn't defined on the object, not among holds those keys.
          if (typeof this.schema[notAmong[i]].required !== 'undefined') {

            throw Error(`${this.schema[notAmong[i]].required![1]}`)
          }
        }

      }

    }
    return [document as T, true];
  }
}

const UserSchema = new Schema(SchemaObj)

const [res, bool] = UserSchema.validateObj<typeof doc>(doc)

console.log(res)
console.log(bool)
