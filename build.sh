grunt --build=base --baseFolder=ZEBASE --basePath=nrg
grunt --build=base --baseFolder=ZEBASE_CTRL --basePath=ute/ui
grunt --build=control --controlLibrary=ute.ui.main --controlFolder=ZECTRL_MAIN
grunt --build=control --controlLibrary=ute.ui.commons --controlFolder=ZECTRL_COMMONS
grunt --build=control --controlLibrary=ute.ui.app --controlFolder=ZECTRL_APP
grunt --build=module --moduleName=nrg.module.app --moduleFolder=ZEMOD_APP
grunt --build=module --moduleName=nrg.module.others --moduleFolder=ZEMOD_OTHERS
grunt --build=module --moduleName=nrg.module.dashboard --moduleFolder=ZEMOD_DSHB
grunt --build=module --moduleName=nrg.module.campaign --moduleFolder=ZEMOD_CMPGN
grunt --build=module --moduleName=nrg.module.quickpay --moduleFolder=ZEMOD_QUICKPAY
grunt --build=component --componentName=nrg.component.ic --componentFolder=ZECMP_IC
