sap.ui.define(["sap/ui/core/Control"],function(a){"use strict";var b=a.extend("ute.ui.app.BodyContent",{metadata:{library:"ute.ui.app",properties:{layout:{type:"ute.ui.app.BodyContentLayout",defaultValue:ute.ui.app.BodyContentLayout.Default}},aggregations:{general:{type:"sap.ui.core.Control",multiple:!0,singularName:"general"},summary:{type:"sap.ui.core.Control",multiple:!0,singularName:"summary"},tool:{type:"sap.ui.core.Control",multiple:!0,singularName:"tool"},footer:{type:"sap.ui.core.Control",multiple:!0,singularName:"footer"},tagline:{type:"sap.ui.core.Control",multiple:!0,singularName:"tagline"}},defaultAggregation:"general"}});return b},!0);