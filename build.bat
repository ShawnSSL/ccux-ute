@echo off
IF [%1] == [] (
	CALL grunt --build=base --baseFolder=ZEBASE --basePath=nrg
	CALL grunt --build=base --baseFolder=ZEBASE_CTRL --basePath=ute/ui
	CALL grunt --build=control --controlLibrary=ute.ui.main --controlFolder=ZECTRL_MAIN
	CALL grunt --build=control --controlLibrary=ute.ui.commons --controlFolder=ZECTRL_COMMONS
	CALL grunt --build=control --controlLibrary=ute.ui.app --controlFolder=ZECTRL_APP
	CALL grunt --build=module --moduleName=nrg.module.app --moduleFolder=ZEMOD_APP
	CALL grunt --build=module --moduleName=nrg.module.others --moduleFolder=ZEMOD_OTHERS
	CALL grunt --build=module --moduleName=nrg.module.dashboard --moduleFolder=ZEMOD_DSHB
	CALL grunt --build=module --moduleName=nrg.module.campaign --moduleFolder=ZEMOD_CMPGN
	CALL grunt --build=module --moduleName=nrg.module.quickpay --moduleFolder=ZEMOD_QUICKPAY
	CALL grunt --build=module --moduleName=nrg.module.billing --moduleFolder=ZEMOD_BILLING
	CALL grunt --build=module --moduleName=nrg.module.bupa --moduleFolder=ZEMOD_BUPA
	CALL grunt --build=module --moduleName=nrg.module.search --moduleFolder=ZEMOD_SEARCH
	CALL grunt --build=module --moduleName=nrg.module.nnp --moduleFolder=ZEMOD_NNP
	CALL grunt --build=module --moduleName=nrg.module.usage --moduleFolder=ZEMOD_USAGE
	CALL grunt --build=component --componentName=nrg.component.ic --componentFolder=ZECMP_IC
) ELSE (
	IF [%1] == [ZEBASE] (
		CALL grunt --build=base --baseFolder=ZEBASE --basePath=nrg
	)
	IF [%1] == [ZEBASE_CTRL] (
		CALL grunt --build=base --baseFolder=ZEBASE_CTRL --basePath=ute/ui
	)
	IF [%1] == [ZECTRL_MAIN] (
		CALL grunt --build=control --controlLibrary=ute.ui.main --controlFolder=ZECTRL_MAIN
	)
	IF [%1] == [ZECTRL_COMMONS] (
		CALL grunt --build=control --controlLibrary=ute.ui.commons --controlFolder=ZECTRL_COMMONS
	)
	IF [%1] == [ZECTRL_APP] (
		CALL grunt --build=control --controlLibrary=ute.ui.app --controlFolder=ZECTRL_APP
	)
	IF [%1] == [ZEMOD_APP] (
		CALL grunt --build=module --moduleName=nrg.module.app --moduleFolder=ZEMOD_APP
	)
	IF [%1] == [ZEMOD_OTHERS] (
		CALL grunt --build=module --moduleName=nrg.module.others --moduleFolder=ZEMOD_OTHERS
	)
	IF [%1] == [ZEMOD_DSHB] (
		CALL grunt --build=module --moduleName=nrg.module.dashboard --moduleFolder=ZEMOD_DSHB
	)
	IF [%1] == [ZEMOD_CMPGN] (
		CALL grunt --build=module --moduleName=nrg.module.campaign --moduleFolder=ZEMOD_CMPGN
	)
	IF [%1] == [ZEMOD_QUICKPAY] (
		CALL grunt --build=module --moduleName=nrg.module.quickpay --moduleFolder=ZEMOD_QUICKPAY
	)
	IF [%1] == [ZEMOD_BILLING] (
		CALL grunt --build=module --moduleName=nrg.module.billing --moduleFolder=ZEMOD_BILLING
	)
	IF [%1] == [ZEMOD_BUPA] (
		CALL grunt --build=module --moduleName=nrg.module.bupa --moduleFolder=ZEMOD_BUPA
	)
	IF [%1] == [ZEMOD_SEARCH] (
		CALL grunt --build=module --moduleName=nrg.module.search --moduleFolder=ZEMOD_SEARCH
	)
	IF [%1] == [ZEMOD_NNP] (
		CALL grunt --build=module --moduleName=nrg.module.nnp --moduleFolder=ZEMOD_NNP
	)
	IF [%1] == [ZEMOD_USAGE] (
		CALL grunt --build=module --moduleName=nrg.module.usage --moduleFolder=ZEMOD_USAGE
	)
	IF [%1] == [ZECMP_IC] (
		CALL grunt --build=component --componentName=nrg.component.ic --componentFolder=ZECMP_IC
	)
)	