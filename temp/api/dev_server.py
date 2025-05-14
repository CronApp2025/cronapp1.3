#!/usr/bin/env python
# dev_server.py
# Script para iniciar un servidor de desarrollo Flask + Vite

import os
import sys
import subprocess
import threading
import time
import signal

# Función para ejecutar el servidor Vite
def run_vite():
    try:
        os.chdir('client')
        subprocess.run(['npm', 'run', 'dev'])
    except Exception as e:
        print(f"Error ejecutando Vite: {e}")
        sys.exit(1)

# Función para ejecutar el servidor Flask
def run_flask():
    try:
        os.chdir('api')
        subprocess.run(['python', 'app.py'])
    except Exception as e:
        print(f"Error ejecutando Flask: {e}")
        sys.exit(1)

# Función para manejar la finalización del script
def signal_handler(sig, frame):
    print("Deteniendo servidores...")
    sys.exit(0)

if __name__ == "__main__":
    print("Iniciando servidor de desarrollo Flask + Vite")
    
    # Registrar el manejador de señales para CTRL+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Iniciar el servidor Vite en un hilo separado
    vite_thread = threading.Thread(target=run_vite)
    vite_thread.daemon = True
    vite_thread.start()
    
    print("Servidor Vite iniciado en segundo plano")
    time.sleep(3)  # Pequeña pausa para que Vite se inicie
    
    # Iniciar el servidor Flask en el hilo principal
    print("Iniciando servidor Flask...")
    run_flask()