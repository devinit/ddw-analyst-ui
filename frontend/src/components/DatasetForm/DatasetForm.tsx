import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { Button, ButtonToolbar, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { Dataset } from '../../types/datasets';
import { MaterialFormGroup } from '../MaterialFormGroup';

const schema = Yup.object().shape({
  title: Yup.string().required('Title is required!'),
  description: Yup.string().required('Description is required!'),
});
const initialValues: Partial<Dataset> = { title: '', description: '' };

export const DatasetForm: React.SFC = () => {
  const [focused, setFocused] = React.useState('');
  const onSuccess = () => {
    console.log('Successful'); //tslint:disable-line
  };
  const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(event.currentTarget.name);
  };
  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.name === focused) {
      setFocused('');
    }
  };

  return (
    <Formik validationSchema={schema} initialValues={initialValues} onSubmit={onSuccess}>
      {({ errors, handleChange, handleSubmit, touched, values }: FormikProps<Dataset>) => (
        <Form className="form" noValidate onSubmit={handleSubmit} data-testid="dataset-form">
          <MaterialFormGroup
            label="Title"
            md="8"
            id="title"
            name="title"
            required
            value={values.title}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            touched={touched.title}
            errors={errors.title}
            focused={focused === 'title'}
          />

          <MaterialFormGroup
            label="Description"
            as="textarea"
            id="description"
            name="description"
            required
            value={values.description}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            touched={touched.description}
            errors={errors.description}
            focused={focused === 'description'}
          />

          <MaterialFormGroup
            label="Publication"
            as="textarea"
            id="publication"
            name="publication"
            required
            value={values.publication}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            touched={touched.publication}
            errors={errors.publication}
            focused={focused === 'publication'}
          />
          <ButtonToolbar>
            <Button className="btn-rose" type="submit">
              Save
            </Button>
          </ButtonToolbar>
        </Form>
      )}
    </Formik>
  );
};

export { DatasetForm as default };
