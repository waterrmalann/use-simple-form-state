import isEqual from 'fast-deep-equal';
import { useCallback, useMemo, useState } from 'react';
import { z, ZodError, ZodSchema } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSimpleFormState<S extends ZodSchema<any>>(schema: S, options: { initialValues: z.infer<S> }) {
    type Values = z.infer<S>;
    type Errors = Partial<Record<keyof Values, string>>;
    type Touched = Partial<Record<keyof Values, boolean>>;

    const [values, setValues] = useState<Values>(options.initialValues);
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Touched>({});

    const setFieldValue = useCallback(<N extends keyof Values>(name: N, value: Values[N]) => {
        setValues(previous => ({ ...previous, [name]: value }));
        setTouched(previous => ({ ...previous, [name]: true }));
    }, []);

    const text = useCallback((name: keyof Values) => {
        if (values[name] != null && typeof values[name] !== 'string') {
            throw new Error(`useSimpleFormState.text(): field '${String(name)}' is not a string`);
        }
        return {
            name,
            value: values[name] ?? '',
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setFieldValue(name, event.target.value),
        };
    }, [values, setFieldValue]);

    const number = useCallback((name: keyof Values) => {
        if (values[name] != null && typeof values[name] !== 'number') {
            throw new Error(`useSimpleFormState.number(): field '${String(name)}' is not a number`);
        }
        return {
            name,
            value: values[name] ?? '',
            onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue(name, event.target.value === '' ? null : Number(event.target.value)),
        };
    }, [values, setFieldValue]);

    const checkbox = useCallback((name: keyof Values) => {
        if (values[name] != null && typeof values[name] !== 'boolean') {
            throw new Error(`useSimpleFormState.checkbox(): field '${String(name)}' is not a boolean`);
        }
        return {
            name,
            checked: !!values[name],
            onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue(name, event.target.checked),
        };
    }, [values, setFieldValue]);

    const select = useCallback((name: keyof Values) => {
        return {
            name,
            value: values[name] ?? '',
            onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
                setFieldValue(name, event.target.value),
        };
    }, [values, setFieldValue]);

    const validate = useCallback(() => {
        try {
            schema.parse(values);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const flattenedErrors = error.flatten().fieldErrors;
                const fieldErrors: Errors = {};
                Object.entries(flattenedErrors).forEach(([key, messages]) => {
                    if (messages && messages.length > 0) {
                        fieldErrors[key as keyof Values] = messages.join(', ');
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    }, [schema, values]);

    const reset = useCallback(() => {
        setValues(() => structuredClone(options.initialValues));
        setErrors({});
        setTouched({});
    }, [options.initialValues]);

    const dirty = useMemo(() => {
        const result: Partial<Record<keyof Values, boolean>> = {};
        (Object.keys(values) as (keyof Values)[]).forEach(key => {
            result[key] = !isEqual(values[key], options.initialValues[key]);
        });
        return result;
    }, [values, options.initialValues]);

    const isDirty = useMemo(() => {
        return Object.values(dirty).some(Boolean);
    }, [dirty]);

    return {
        /** The current form values. */
        values,
        /** The current form errors. */
        errors,
        /** All the fields that have been touched. */
        touched,
        /** Per-field dirty flags (true if value differs from initialValues). */
        dirty,
        /** Whether any of the field was changed. */
        isDirty,
        /** Specialized field binding helpers. */
        bind: {
            /** Text input props for string fields. */
            text,
            /** Number input props for numeric fields. */
            number,
            /** Checkbox input props for boolean fields. */
            checkbox,
            /** Select input props for select fields. */
            select,
        },
        /** Sets the value of a form field. */
        setFieldValue,
        /** Validates the form values against the schema. */
        validate,
        /** Resets the form to its initial values. */
        reset,
    };
}
