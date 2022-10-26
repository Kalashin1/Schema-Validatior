# Let's build a Schema

Quite recently i took some time to build a schema validator, this was a direct result of working with MongoDB and mongoose. I thought about how the Schema validator worked in mongoose and what else is better than reinventing the wheel? If you've worked with mongoose and MongoDB you will understand what I'm talking about. This is not meant to replace the real deal, however I undertook this ordeal to get a better understanding of how the schema validator works under the hood and to deepen our problem solving skills.

When we are working with mongoose we will define an schema, this schema will validate the objects we try to add to the collection we attach the schema to, a typical example of a mongoose schema will look like below;

```typescript
import { Schema } from 'mongoose'

const UserSchema = new Schema({
  name: {
	 type: String,
  },
  age: {
	 type: Number
  },
  hobbies: {
	type: Array
  }
});
```
We then use this schema to create a model, whenever we try to add a new document to the collection, the schema will ensure that we define the right properties with the right values. Okay, we are going to be building our implementation with typescript. First we will define the types.

```typescript
export  interface  ISchema {
	[Key: string]: schemaProp
}

type  schemaProp = {
	type: schmeValueType
	required?: [boolean, string]
	default?: schmeValueType
	minLength?: [number, string]
	maxLength?: [number, string]
	min?: [number, string]
	max?: [number, string]
	validate?: [(v: string) =>  boolean, string];
}

type  schmeValueType = String | Number | Boolean | Object | Array<any> | null;
```
We used a dictionary type to type the property key on the schema, this is because we cannot explicitly tell the property key, but for sure we know that it will be a string. We expect every key on the schema to follow the `schemaProp` type.  On the `SchemaProp` type, we define some properites that will determine how we will validate each field on the object. The only required property is the `type`, which equals to the constructor of some basic types provided by TypeScript, let's create a schema class;

```typescript
import { ISchema } from  "./types/types";
import { ArrayEquals } from  "./utils/bootstrap"; 

export  class  Schema {
	constructor(readonly  schema: ISchema) { }
	validateObj<T>(doc: any): [T, boolean] {

	// obtain an array of the keys on the schema
	const  keys = Object.keys(this.schema);

	// create an empty object we will populate with fields that passes the test
	let  document: Record<string, any> = {}

	// check for properties that have a default value
	for (const  key  in  this.schema) {
		if (Object.prototype.hasOwnProperty.call(this.schema, key)) {
		const  element: typeof  this.schema[typeof  key] = this.schema[key];
		// if they don't define a value for the required property
		// set it to the one defined on the schema
		if (typeof  element.default !== 'undefined' && !(doc[key])) {
			document[key] = element.default
			doc[key] = element.default
		} 
		else {
				continue;
			}
		}
	}  
	// obtain the keys defined on the object
	const  _K = Object.keys(doc);

	// check if a property is defined on the schema but not on the object
	const [, notAmong] = ArrayEquals(keys.sort(), _K.sort())
	// console.log(notAmong)
	for (const  key  in  doc) {
		if (
			// the key exits in the document
			Object.prototype.hasOwnProperty.call(doc, key) &&
			// check if the constructor of the value matches the constructor
			// type defined on the type property on the schema
			(doc[key]).constructor == this.schema[key].type)
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
			throw  Error(this.schema[key].minLength![1]);
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
			throw  console.error(this.schema[key].maxLength![1]);
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
			throw  Error(this.schema[key].min![1]);
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
			throw  Error(this.schema[key].max![1])
		}
		// checking for RegExp for a if valiate is defined
		if (
			(doc[key]).constructor === String &&
			this.schema[key].validate &&
			!this.schema[key].validate![0](doc[key])
		) {
			throw  Error(this.schema[key].validate![1])
		}
		document[key] = doc[key]
		// console.log(this.schema[key].required)
		// if theres isnt a match between the 
		// constructor for a particular key
		// throw an error;
		} 
		else  if (this.schema[key] && this.schema[key].type !== (doc[key]).constructor) {
			throw  Error(`Value is of invalid type for ${keys.find(k  =>  k == key)}`)
		}
		else {
				let  i = 0
				for (i; i < notAmong.length; i++) {
					// for every property key required on the schema,
					// that isn't defined on the object, not among holds those keys.
					if (typeof  this.schema[notAmong[i]].required !== 'undefined') {
						throw  Error(`${this.schema[notAmong[i]].required![1]}`)
					}
				}
			 }
		  }
		return  [document  as  T, true];
	}
}
```
We obtain an array of the keys defined on the schema, we then create a map to store fields that will pass our property validation check. We start our validation check, we first check for properties that have a default value set on the schema, if the object we are trying to validate does not have any value set for the required field or the key is not set,  we use the default value set on the schema, however if it is defined on the object with a different value, we use it. Then we loop the schema with the help of a `for-in` loop. 

Next we obtain an array of the keys on the object we are trying to validate, we use a function, `ArrayEquals`, this function checks if two arrays are equal to each other. It returns to us a boolean and an array of the keys that do not match. Next we check if the constructor of the property value equals the constructor defined for that key on the schema. We now do second level checks, this handles things like string length, number values, after that we do regExp validation, if the validate property is defined on the schema.


Lastly we check the not among array, for every key defined on the schema that is not defined on the object, we throw an error. Let's take a tour of the helper function we used, `ArrayEquals`. 

```typescript
export  function  ArrayEquals<T>(a: Array<T>, b: Array<T>): [boolean, T[]] {
	let  notAmong: T[] = []
	a.forEach((i, _in) => {
	if (!b.find((bI) => (bI == i))) {
		notAmong.push(i)
	}
})

return [Array.isArray(a) &&
	Array.isArray(b) &&
	a.length === b.length &&
	a.every((val: T, index) =>  val === b[index]), notAmong]
}
```
I have to admit, this is where [stackOverflow](https://stackoverflow.com) came in, but the code above is easy to explain, loop throuh a, the check inside p if you can find the current iteration of a, if not add it to the not among array, then we retun a predicate, is `a` and `b` is an array, and the length of `a` is equal to the length of `b` and `a` exits inside `b`, lastly we return the `notAmong` array. We returned the both items inside an array to allow destructring based off what we want to do.

Let's see our code in action,
```typescript
const  SchemaObj:ISchema = {
	name: {
		type:  String,
		maxLength: [50, 'Exceeded the max length'],
		minLength: [5, 'Less than the min length for the value']
	},
	age: {
		type:  Number,
		min: [5, 'Lowest possible value is 5'],
		max: [25, 'Highest possible value is 10']
	},
	email: {
		type:  String,
		required: [true, 'Please provide an email'],
		validate: [
					(v: string) =>  Validators.isEmail.test(v),
					'Invalid email'
				   ]
		},
	isAdult: {
		type:  Boolean
		},
	hobbies: {
		type:  Array
	},
	socials: {
		type:  Object
	},
height: {
		type:  Number,
		default:  10
	},
gender: {
	type:  String,
	required: [true, "Provide a gender"]
	}
}  

const  doc = {
	name:  'Kinanee',
	age:  20,
	// isAdult: true,
	email:  'kinaneesamsonjohn@gmail.com',
	hobbies: ["singing"],
	socials: {
		"youtube":  "link",
		"facebook":  "link"
	},
	gender:  'M',
}

const  UserSchema = new  Schema(SchemaObj)
const [res, bool] = UserSchema.validateObj<typeof  doc>(doc)

console.log(res)
console.log(bool)
```
You can view the full code at repo

Okay, there is our most basic implementation, one thing I noticed somethings with the code, first we are using too many if statements and I personally don't feel comfortable about this, then we are also repeating ourselves. This are areas to work on and improve the code significantly, but hey this is just a fun test, another thing I also noticed was how we were testing our code manually, it would be nice if we could use write some unit test on the code. Of course we can so maybe we'll look at how we can improve on the code, add unit tests too, We can look at adding things like timestamps and auto generated Id's. You can take your time to familiarize yourself to the code, I woud love to hear you thoughts on what we've done here, and how we could make this look more elegant in the future, If you've done something in the past that's similar to this then a word from you about it would be very much appreciated.

To read more articles like this visit  
