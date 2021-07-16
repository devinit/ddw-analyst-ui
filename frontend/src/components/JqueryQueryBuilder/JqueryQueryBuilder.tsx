import React, { FunctionComponent, useEffect } from 'react';
// import * from 'react-bootstrap';

interface JqueryQueryBuilder {
  show?: boolean;
}

const JqueryQueryBuilder: FunctionComponent<JqueryQueryBuilder> = () => {
  const rules_basic = {
    condition: 'AND',
    rules: [
      {
        id: 'price',
        operator: 'less',
        value: 10.25,
      },
      {
        condition: 'OR',
        rules: [
          {
            id: 'category',
            operator: 'equal',
            value: 2,
          },
          {
            id: 'category',
            operator: 'equal',
            value: 1,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    (window as any).$('#builder').queryBuilder({
      filters: [
        {
          id: 'name',
          label: 'Name',
          type: 'string',
        },
        {
          id: 'category',
          label: 'Category',
          type: 'integer',
          input: 'select',
          values: {
            1: 'Books',
            2: 'Movies',
            3: 'Music',
            4: 'Tools',
            5: 'Goodies',
            6: 'Clothes',
          },
          operators: ['equal', 'not_equal', 'in', 'not_in', 'is_null', 'is_not_null'],
        },
        {
          id: 'in_stock',
          label: 'In stock',
          type: 'integer',
          input: 'radio',
          values: {
            1: 'Yes',
            0: 'No',
          },
          operators: ['equal'],
        },
        {
          id: 'price',
          label: 'Price',
          type: 'double',
          validation: {
            min: 0,
            step: 0.01,
          },
        },
        {
          id: 'id',
          label: 'Identifier',
          type: 'string',
          placeholder: '____-____-____',
          operators: ['equal', 'not_equal'],
          validation: {
            format: /^.{4}-.{4}-.{4}$/,
          },
        },
      ],

      rules: rules_basic,
    });

    (window as any).$('#btn-reset').on('click', function () {
      (window as any).$('#builder-basic').queryBuilder('reset');
    });

    (window as any).$('#btn-set').on('click', function () {
      (window as any).$('#builder-basic').queryBuilder('setRules', rules_basic);
    });

    (window as any).$('#btn-get').on('click', function () {
      const result = (window as any).$('#builder-basic').queryBuilder('getRules');

      if (!(window as any).$.isEmptyObject(result)) {
        alert(JSON.stringify(result, null, 2));
      }
    });
  }, []);

  return <div id="builder" />;
};

export { JqueryQueryBuilder };
