find src \( -name "*.d.ts" -o -name "*.js" \) \
! -name "global.d.ts" \
! -name "react-table-config.d.ts" \
! -name "Placement.d.ts" \
-delete
