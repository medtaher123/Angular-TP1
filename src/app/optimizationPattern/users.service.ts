import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';

export interface User {
  name: string;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  users: User[] = [];

  constructor() {
    for (let i = 0; i < 50; i++) {
      this.users.push({
        name: faker.name.fullName(),
        age: faker.datatype.number({ min: 18, max: 30 })
      });
    }
  }

  getOddOrEven(isOdd = false): User[] {
    return this.users.filter((user) => !!(user.age % 2) === isOdd);
  }

  /**
   * ✅ Nouvelle méthode: Crée un utilisateur sans muter de liste
   * Retourne un nouvel objet User pour permettre l'immutabilité
   */
  createUser(name: string): User {
    return {
      name,
      age: faker.datatype.number({ min: 18, max: 30 })
    };
  }

  /**
   * @deprecated Utiliser createUser() avec immutabilité pour OnPush
   */
  addUser(list: User[], name: string) {
    list.unshift({
      name,
      age: faker.datatype.number({ min: 18, max: 30 })
    });
  }
}
