import React, { useState, useEffect } from "react";
import axios from "axios";

import personService from "./services/persons";

const Name = ({ persons, index }) => {
  return (
    <p>
      Name: {persons[index].name} <br /> Number: {persons[index].number}
    </p>
  );
};

const AllListItems = ({ persons, handleDeleteButtonClick }) => {
  return persons.map((name, index) => (
    <div key={index}>
      <Name persons={persons} index={index} />
      <button onClick={() => handleDeleteButtonClick(name.id)}>Delete</button>
    </div>
  ));
};

const FilterList = ({ filter, persons, handleDeleteButtonClick }) => {
  const result = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );
  if (result.length < 1) {
    return <p>No matches found.</p>;
  }

  return result.map((filteredPerson) => (
    <div>
      <p>
        Name: {filteredPerson.name} <br /> Number: {filteredPerson.number}
      </p>
      <button onClick={() => handleDeleteButtonClick(filteredPerson.id)}>
        Delete
      </button>
    </div>
  ));
};

const ErrorNotification = ({ message, isPositive }) => {
  if (message === null) {
    return null;
  }

  if (isPositive === false && message !== null) {
    return <div className="error">{message}</div>;
  }
  return <div className="notification">{message}</div>;
};
const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState(null);
  const [isPositive, setIsPositive] = useState(true);

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  console.log("render", persons.length, "persons");

  const addObject = (event) => {
    event.preventDefault();
    const nameObject = {
      name: newName,
      number: newNumber
    };

    const found = persons.some((el) => el.name === newName);
    if (found === true) {
      persons.map((person) => {
        if (person.name === newName) {
          userExists(person.id);
        }
      });
    } else {
      personService.create(nameObject).then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setMessage(`Added ${returnedPerson.name}`);
        setTimeout(() => {
          setMessage(null);
        }, 5000);
        setNewName("");
        setNewNumber("");
      });
    }
  };

  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    console.log(event.target.value);
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    console.log(event.target.value);
    setFilter(event.target.value);
  };

  const handleDeleteButtonClick = (id) => {
    if (window.confirm("Do you want to delete item?")) {
      personService.deleteObject(id);
      setPersons(
        persons.filter((person) => {
          return person.id !== id;
        })
      );
    }
  };

  const userExists = (id) => {
    if (
      window.confirm(
        `${newName} is already added to the phonebook, replace the old number with a new one?`
      )
    ) {
      const person = persons.find((p) => p.id === id);
      const changedPerson = { ...person, number: newNumber };

      personService
        .update(id, changedPerson)
        .then((returnedPerson) => {
          setPersons(
            persons.map((person) =>
              person.id !== id ? person : returnedPerson
            )
          );
        })
        .catch((error) => {
          setIsPositive(false);
          setMessage(
            `Information of ${person.name} was already removed from server`
          );
          setTimeout(() => {
            setMessage(null);
          }, 5000);
          setIsPositive(true);
        });
      setNewName("");
      setNewNumber("");
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <ErrorNotification message={message} isPositive={isPositive} />
      <form onSubmit={addObject}>
        <div>
          Filter names containing:{" "}
          <input value={filter} onChange={handleFilterChange} />
        </div>
      </form>

      <h3>Add new item</h3>

      <form onSubmit={addObject}>
        <div>
          Name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          Number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">Add</button>
        </div>
      </form>

      <h3>Numbers</h3>
      {filter === "" ? (
        <AllListItems
          persons={persons}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      ) : (
        <FilterList
          persons={persons}
          filter={filter}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      )}
    </div>
  );
};

export default App;
