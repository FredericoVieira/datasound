from app import manager
from flask_script import Server
from config import Config

server = Server(host="0.0.0.0", port=Config.PORT)

manager.add_command('runserver', server)
manager.run()
