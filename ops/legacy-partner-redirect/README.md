# Legacy Flames Partner addresses

Static routing only, deployed to the existing `flames-partner` Vercel project. It preserves old public addresses while removing the old application, functions and daily job. It contains no database connection, server code or email credentials. Keep its source Git deployment disconnected so an old-app push cannot revive it.

Canonical application: https://www.oneflamerecords.com/flames-partner . API/signout and non-reading requests return 410. Public/admin reading links redirect to the equivalent One Flame route. Old authentication links require a fresh One Flame sign-in; source authentication tokens cannot be migrated. Unknown links go to the section landing page. Source data and Git history are not deleted by this routing configuration.
