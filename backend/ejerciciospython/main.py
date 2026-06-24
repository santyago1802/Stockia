from abc import ABC, abstractmethod
class Usuario(ABC):
    def __init__(self, nombre, correo, rol):
        self.__nombre = nombre
        self.__correo = correo
        self.__rol = rol

    def get_nombre(self):
        return self.__nombre
    def set_nombre(self, nombre):
        self.__nombre = nombre

    def get_correo(self):
        return self.__correo
    def set_correo(self, correo):
        self.__correo = correo

    def get_rol(self):
        return self.__rol
    def set_rol(self, rol):
        self.__rol = rol

    @abstractmethod
    def realizar_accion(self):
        pass

class Instructor(Usuario):
    def __init__(self, nombre, correo):
        super().__init__(nombre, correo, "Instructor")

    def realizar_accion(self):
        if self.get_rol() == "Instructor":
            return f"{self.get_nombre()} solicitabdo material en el sistema."

class Almacenista(Usuario):
    def __init__(self, nombre, correo):
        super().__init__(nombre, correo, "almacenista")

    def realizar_accion(self):
        if self.get_rol() == "almacenista":
            return f"{self.get_nombre()} gestionando inventario del sistema."
        
class Coordinador(Usuario):
    def __init__(self, nombre, correo):
        super().__init__(nombre, correo, "coordinador")

    def realizar_accion(self):
        if self.get_rol() == "coordinador":
            return f"{self.get_nombre()} revisando inventario del sistema."

instructor1 = Instructor("Carlos", "carlos@example.com")

almacenista1 = Almacenista("Maria", "maria@example.com")

coordinador1 = Coordinador("Ana", "ana@example.com")

print(instructor1.realizar_accion())
print(almacenista1.realizar_accion())
print(coordinador1.realizar_accion())