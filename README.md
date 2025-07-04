# use-simple-form-state

> Yet another React form management hook built for Zod.

**Lightweight. Typesafe. Zero magic.**

**`use-simple-form-state`** is a minimalist React hook for managing form state, validation, dirty-checking, and field bindings—built specifically to work with [Zod](https://zod.dev).

If you think Formik or React Hook Form are overkill for your simple forms, but `useState` is too naive—this is for you.

---

## Features

- Fully typesafe with Zod schemas
- Per-field dirty tracking using deep equality
- Easy field bindings for inputs, checkboxes, selects
- Validation with Zod’s error flattening
- Zero external dependencies (except `Zod` and `fast-deep-equal`)
- Tiny, framework-agnostic API

---

## Install

```bash
npm install zod fast-deep-equal
```

Just copy the hook source into your repo.

---

## Usage Example

### 1️⃣ Define your schema

```tsx
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be positive'),
  isAdmin: z.boolean(),
  role: z.string(),
});
```

### 2️⃣ Initialize in your component

```tsx
const form = useSimpleFormState(userSchema, {
  initialValues: {
    name: '',
    age: 0,
    isAdmin: false,
    role: '',
  },
});
```

### 3️⃣ Use the bindings

```tsx
<form onSubmit={(e) => {
  e.preventDefault();
  if (form.validate()) {
    console.log('Form is valid!', form.values);
  }
}}>
  <input {...form.bind.text('name')} placeholder="Name" />
  {form.errors.name && <span>{form.errors.name}</span>}

  <input type="number" {...form.bind.number('age')} placeholder="Age" />
  {form.errors.age && <span>{form.errors.age}</span>}

  <input type="checkbox" {...form.bind.checkbox('isAdmin')} /> Is Admin

  <select {...form.bind.select('role')}>
    <option value="">Select a role</option>
    <option value="user">User</option>
    <option value="admin">Admin</option>
  </select>
  {form.errors.role && <span>{form.errors.role}</span>}

  <button type="submit" disabled={!form.isDirty}>
    Submit
  </button>

  <button type="button" onClick={form.reset} disabled={!form.isDirty}>
    Reset
  </button>
</form>
```

---

## API

### `useSimpleFormState(schema, options)`

**Parameters:**

- `schema`: ZodSchema – your validation schema.
- `options.initialValues`: object – initial form values matching the schema.

---

**Returns:**

| Key             | Type     | Description                                           |
| --------------- | -------- | ----------------------------------------------------- |
| `values`        | object   | Current form values                                   |
| `errors`        | object   | Validation errors (flattened per field)               |
| `touched`       | object   | Flags for fields that have been interacted with       |
| `dirty`         | object   | Per-field dirty status (true if differs from initial) |
| `isDirty`       | boolean  | True if any field is dirty                            |
| `bind`          | object   | Helpers for binding fields                            |
| `setFieldValue` | function | Programmatically set a field value                    |
| `validate`      | function | Runs Zod validation, sets errors, returns boolean     |
| `reset`         | function | Resets the form to initialValues                      |

---

### `bind` helpers

- `bind.text(name)`: For string inputs.
- `bind.number(name)`: For numeric inputs.
- `bind.checkbox(name)`: For booleans.
- `bind.select(name)`: For select elements.

Each returns an object of props you can spread onto inputs.

---

## Dirty Tracking

Uses `fast-deep-equal` to compare `values` with `initialValues`:

- `dirty` – map of per-field dirty flags.
- `isDirty` – true if any field is dirty.

Great for enabling/disabling submit/reset buttons precisely.

---

## Validation

Uses Zod’s `.parse()` and `.flatten()`:

- `validate()` returns true if valid.
- Sets `errors` with a flat map of field error messages.

---

## Design Philosophy

> *Less is more.*

This hook doesn't try to be a form framework.
It just gives you **state**, **validation**, **dirty checking**, and **input bindings** in \~130 lines of well-typed code.

If you want schema validation with Zod without learning Formik or React Hook Form, this is for you.

---

## Limitations

⚠️ Error mapping is *flat*.
Nested objects will return errors like `'user.address.street': 'Required'`.

⚠️ Select binding assumes string values by default.
For number/enums, you'll need to parse manually (or extend the hook).

---

## License

MIT

---

## Why another form hook?

Because **Formik and React Hook Form are too heavy** for many dialogs and simple forms.
But plain `useState` is too naive when you want:

- Validation
- Dirty checking
- Touched states
- Easy field bindings

This hook hits that sweet spot.

---

That’s it. Enjoy.
