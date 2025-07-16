import _ from 'lodash';

const removeNonLoggableVariables = ({ nonLoggableVariables, requestVariables }) => {
  if (!nonLoggableVariables) return requestVariables;
  return Object.keys(requestVariables).reduce((acc, current) => {
    if (nonLoggableVariables.includes(current)) {
      return acc;
    }
    if (typeof requestVariables[current] === 'object') {
      const cleanObject = removeNonLoggableVariables({
        nonLoggableVariables,
        requestVariables: requestVariables[current],
      });
      return {
        ...acc,
        ...(!_.isEmpty(cleanObject) && { [current]: cleanObject }),
      };
    }
    return {
      ...acc,
      [current]: requestVariables[current],
    };
  }, {});
};

export default removeNonLoggableVariables;
