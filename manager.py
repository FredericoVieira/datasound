from app import manager

import os
from flask_script import Server
port = int(os.environ.get("PORT", 5000))
server = Server(host="0.0.0.0", port=port)

manager.add_command('runserver', server)
manager.run()
