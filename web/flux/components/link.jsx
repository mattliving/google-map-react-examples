import React, {PropTypes, Component} from 'react/addons';
import shouldPureComponentUpdate from 'react-pure-render/function';
import routeTemplate from 'utils/route_template.js';
import fluxComponentDecorator from 'components/decorators/flux_component_decorator.js';
// TODO replace fluxComponentDecorator with import {connect} from 'flummox/connect';

@fluxComponentDecorator({
  connectToStores: {
    route: (store /*, props*/) => ({
      routeFullPath: store.getRouteFullPath(),
      routeParams: store.getRouteParams()
    })
  },
  injectActions: {
    route: (actions) => ({
      onGotoLink: actions.gotoLink
    })
  }
})
export default class Link extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    onGotoLink: PropTypes.func,
    defaultParams: PropTypes.any,
    params: PropTypes.any,
    href: PropTypes.string,
    routeParams: PropTypes.any,
    routeFullPath: PropTypes.string,
    children: PropTypes.any
  }

  shouldComponentUpdate = shouldPureComponentUpdate;

  _routeTemplatesCache = {};

  constructor(props) {
    super(props);
  }

  _getEvaluatedLink(link, defaultParams, params, routeParams) {
    if (routeParams && link !== undefined && typeof link === 'string') {
      if (!(link in this._routeTemplatesCache)) {
        this._routeTemplatesCache[link] = routeTemplate(link);
      }
      const linkTemplate = this._routeTemplatesCache[link];
      const evaluatedLink = linkTemplate(Object.assign({}, defaultParams, routeParams, params));

      return evaluatedLink;
    }
    return link;
  }

  isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  _onClick = (event) => {
    if (!this.isModifiedEvent(event)) {
      const link = this._getEvaluatedLink(
        this.props.href,
        this.props.defaultParams || {},
        this.props.params || {},
        (this.props.routeParams && this.props.routeParams.toJS()) || null);
      if (this.props.routeFullPath !== link) {
        this.props.onGotoLink(link);
      }

      event.preventDefault();
    }

    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const {href, defaultParams, params, onClick, routeParams, ...otherProps} = this.props; // eslint-disable-line no-unused-vars
    const link = this._getEvaluatedLink(href, defaultParams || {}, params || {}, (routeParams && routeParams.toJS()) || null);

    return (
      <a onClick={this._onClick} href={link} {...otherProps}>{this.props.children}</a>
    );
  }
}
