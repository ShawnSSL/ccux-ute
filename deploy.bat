@SETLOCAL
@IF NOT [%1] == [] (
	@SET ECLIPSE_WORKSPACE_PATH=%1
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEBASE (
    @CALL grunt --deploy=base --baseFolder=ZEBASE --baseName=nrg.base --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEBASE
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEBASE does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEBASE_CTRL (
    @CALL grunt --deploy=base --baseFolder=ZEBASE_CTRL --baseName=ute.ui.base --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEBASE_CTRL
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEBASE does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZECTRL_MAIN (
    @CALL grunt --deploy=control --controlFolder=ZECTRL_MAIN --controlName=ute.ui.main --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZECTRL_MAIN
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZECTRL_MAIN does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZECTRL_COMMONS (
    @CALL grunt --deploy=control --controlFolder=ZECTRL_COMMONS --controlName=ute.ui.commons --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZECTRL_COMMONS
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZECTRL_COMMONS does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZECTRL_APP (
    @CALL grunt --deploy=control --controlFolder=ZECTRL_APP --controlName=ute.ui.app --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZECTRL_APP
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZECTRL_APP does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_APP (
    @CALL grunt --deploy=module --moduleName=nrg.module.app --moduleFolder=ZEMOD_APP --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_APP
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_APP does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_OTHERS (
    @CALL grunt --deploy=module --moduleName=nrg.module.others --moduleFolder=ZEMOD_OTHERS --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_OTHERS
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_OTHERS does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_DSHB (
    @CALL grunt --deploy=module --moduleName=nrg.module.dashboard --moduleFolder=ZEMOD_DSHB --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_DSHB
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_DSHB does not exists.
)

@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_CMPGN (
    @CALL grunt --deploy=module --moduleName=nrg.module.campaign --moduleFolder=ZEMOD_CMPGN --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_CMPGN
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_CMPGN does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_QUICKPAY (
    @CALL grunt --deploy=module --moduleName=nrg.module.quickpay --moduleFolder=ZEMOD_QUICKPAY --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_QUICKPAY
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_QUICKPAY does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_BILLING (
    @CALL grunt --deploy=module --moduleName=nrg.module.billing --moduleFolder=ZEMOD_BILLING --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_BILLING
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_BILLING does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_BUPA (
    @CALL grunt --deploy=module --moduleName=nrg.module.bupa --moduleFolder=ZEMOD_BUPA --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_BUPA
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_BUPA does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_SEARCH (
    @CALL grunt --deploy=module --moduleName=nrg.module.search --moduleFolder=ZEMOD_SEARCH --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_SEARCH
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_SEARCH does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_USAGE (
    @CALL grunt --deploy=module --moduleName=nrg.module.usage --moduleFolder=ZEMOD_USAGE --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_USAGE
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_USAGE does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZEMOD_NNP (
    @CALL grunt --deploy=module --moduleName=nrg.module.nnp --moduleFolder=ZEMOD_NNP --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZEMOD_NNP
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZEMOD_NNP does not exists.
)
@IF EXIST %ECLIPSE_WORKSPACE_PATH%\ZECMP_IC (
    @CALL grunt --deploy=component --componentName=nrg.component.ic --componentFolder=ZECMP_IC --eclipseProjectPath=%ECLIPSE_WORKSPACE_PATH%\ZECMP_IC
) ELSE (
    @ECHO Path %ECLIPSE_WORKSPACE_PATH%\ZECMP_IC does not exists.
)

@ENDLOCAL