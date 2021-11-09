import React, { FunctionComponent, useContext, useState } from 'react';
import { SourceMap } from '../../types/sources';
import { JqueryQueryBuilder } from '../JqueryQueryBuilder';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { createQueryBuilderRules, parseQuery } from '../JqueryQueryBuilder/utils';
import { AdvancedQueryOptions, JqueryQueryBuilderFieldData } from '../../types/operations';
import { getColumnGroupOptionsFromSource } from '../AdvancedSelectQueryBuilder/ColumnSelector/utils';

interface ComponentProps {
  source: SourceMap;
}

export type FilterWith = '$and' | '$or';

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [jqBuilder, setJqBuilder] = useState<any>({});

  const fieldData: JqueryQueryBuilderFieldData[] = getColumnGroupOptionsFromSource(source).map(
    (column) => {
      return {
        id: column.value,
        label: column.text,
        type: 'string',
        operators: ['equal', 'less', 'greater'],
      };
    },
  );

  const getJqueryBuilderInstance = (jqInstance: any) => {
    setJqBuilder(jqInstance);
  };

  const onReplace = () => {
    const rules = jqBuilder?.getRules();
    options.filter = parseQuery({}, rules.condition, rules);
    if (updateOptions) {
      updateOptions(options as AdvancedQueryOptions);
    }
  };

  const onReset = () => {
    jqBuilder?.reset();
  };

  return (
    <>
      <JqueryQueryBuilder
        fieldData={fieldData}
        getJqueryBuilderInstance={getJqueryBuilderInstance}
        icons={{
          add_group: 'fa fa-plus-circle',
          add_rule: 'fa fa-plus',
          remove_group: 'fa fa-times realign',
          remove_rule: 'fa fa-times realign',
          error: 'fa fa-exclamation-triangle',
        }}
        rules={createQueryBuilderRules({}, options.filter)}
      />
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="bottom"
          data-html="true"
          title={`<i>Replaces</i> existing filter config`}
          onClick={() => onReplace()}
        >
          Replace
        </Button>
        <Button
          variant="dark"
          size="sm"
          data-toggle="tooltip"
          data-placement="bottom"
          data-html="true"
          title={`<i>Resets</i> config to default JSON`}
          onClick={onReset}
        >
          Reset
        </Button>
      </ButtonGroup>
    </>
  );
};

export { AdvancedFilterQueryBuilder };
