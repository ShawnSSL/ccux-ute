/*global sap, ute*/
/*jslint nomen:true*/

sap.ui.define(
    [
        'sap/m/BusyDialog',
        'sap/ui/core/EnabledPropagator',
        'sap/m/Button'
    ],

    function (BusyDialog, EnabledPropagator, Button) {
        'use strict';

        var NrgBusyDialog = BusyDialog.extend('nrg.module.app.view.NrgBusyDialog', { metadata : {
            events: {
					/**
					 * Fires when the busy dialog is closed.
					 */
				"stop": {
				    parameters: {
							/**
							 * Indicates if the close events are triggered by a user, pressing a cancel button or because the operation was terminated.
							 * This parameter is set to true if the close event is fired by user interaction.
							 */
				        cancelPressed: {type: "boolean"}
				    }
				}
            }
        },
			// requires a dummy render function to avoid loading of separate
			// renderer file and in case of usage in control tree a render
			// function has to be available to not crash the rendering
			renderer: {

            }
            });


      // execute standard init  method to override sap escape functionality and adding new style class
        NrgBusyDialog.prototype.init = function () {
            BusyDialog.prototype.init.apply(this, arguments);

			//keyboard handling
			this._oDialog.oPopup.onsapescape = function (e) {
				//this.close(true); // Disabling escape option for loading images.
			}.bind(this);
            this._oDialog.addStyleClass("nrgBusyDialog");
		};
		/**
		 * Opens the BusyDialog.
		 *
		 * @type sap.m.BusyDialog
		 * @public
		 */
		BusyDialog.prototype.open = function (bShowStopImmediately) {
			//jQuery.sap.log.debug("sap.m.BusyDialog.open called at " + new Date().getTime());

			if (this.getAriaLabelledBy() && !this._oDialog._$dialog) {
				var that = this;
				this.getAriaLabelledBy().forEach(function (item) {
					that._oDialog.addAriaLabelledBy(item);
				});
			}
			//if the code is not ready yet (new sap.m.BusyDialog().open()) wait 50ms and then try ot open it.
			if (!document.body || !sap.ui.getCore().isInitialized()) {
				setTimeout(function () {
					this.open();
				}.bind(this), 50);
			} else {
                if (!bShowStopImmediately) {
                    this._cancelButton.setVisible(false);
                    if (this._stopButtonTimer) {
                        clearTimeout(this._stopButtonTimer);
                    }
                    this._stopButtonTimer = setTimeout(function () {
                        if (this._oDialog.isOpen()) {
                            this.showCancelButton();
                        }
                    }.bind(this), 30000);

                } else {
                    this.showCancelButton();
                }
                this._oDialog.open();
			}
			return this;
		};

		BusyDialog.prototype.showCancelButton = function () {
            this._getCancelButton().setVisible(true);
        };
        // over riding cancel button functonality to raise custom event
		BusyDialog.prototype._getCancelButton = function () {
			var cancelButtonText = this.getCancelButtonText();
			cancelButtonText = cancelButtonText || sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("BUSYDIALOG_CANCELBUTTON_TEXT");

			this._cancelButton = (this._cancelButton) || (new Button(this.getId() + 'busyCancelBtn', {
				text: cancelButtonText,
				press: function () {
					this.close(true);
                    this.CancelClicked();
				}.bind(this)
			}));
            this._cancelButton.setVisible(false);
            return this._cancelButton;
		};
        BusyDialog.prototype.CancelClicked = function (isClosedFromUserInteraction) {
            this.fireStop({cancelPressed: isClosedFromUserInteraction || false});
        };
        return NrgBusyDialog;
    }
);
