import React, { useEffect, useState } from 'react';

import { testToDos } from './testToDos';

const Context = React.createContext({
    toDos: [],
    categories: [],
    listBy: '',
    mobileMenu: [],
    onShowMobileMenu: () => { },
    onAdd: () => { },
    onCategoryAdd: () => { },
    onCategoryDelete: () => { },
    onComplete: () => { },
    onEdit: () => { },
    onCategoryEdit: () => { },
    onPriorityChange: () => { },
    onSetListBy: () => { },
    onSetSearch: () => { },
    onListToDos: () => { },
    onDelete: () => { },
    onDeleteAll: () => { },
    onLoadToDos: () => { }
});

export const ContextProvider = props => {
    const [toDos, setToDos] = useState(JSON.parse(localStorage.getItem('ToDos')) || []);
    const [categories, setCategories] = useState(JSON.parse(localStorage.getItem('Categories')) || ['None']);
    const [search, setSearch] = useState('');
    const [listBy, setListBy] = useState('all');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const setShowMobileMenuHandler = () => {
        setShowMobileMenu(prevState => !prevState);
    };

    // LOAD
    const loadToDosHandler = testToDos => {
        setToDos(() => {
            const updatedToDos = testToDos.concat();
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });

        let updatedCategories = ['None'];
        for (let i = 0; i < testToDos.length; i++) {
            if (!updatedCategories.find(el => el === testToDos[i].category))
                updatedCategories.push(testToDos[i].category);
        };

        setCategories(() => {
            localStorage.setItem('Categories', JSON.stringify(updatedCategories));
            return updatedCategories;
        });
    };

    // CLEARS TODOS ON VERSION CHANGE
    useEffect(() => {
        const appVersion = '1.0.15';
        const storageVersion = JSON.parse(localStorage.getItem('Version')) || '';
        if (storageVersion !== appVersion) {
            localStorage.removeItem('ToDos');
            localStorage.removeItem('Version');
            localStorage.removeItem('Categories');
            localStorage.setItem('Version', JSON.stringify(appVersion));

            // TEMP 🛑
            localStorage.setItem('ToDos', JSON.stringify(testToDos));
            setToDos(testToDos); // TEMP 🛑            

            let updatedCategories = ['None'];
            for (let i = 0; i < testToDos.length; i++) {
                if (!updatedCategories.find(el => el === testToDos[i].category))
                    updatedCategories.push(testToDos[i].category);
            };

            setCategories(() => {
                localStorage.setItem('Categories', JSON.stringify(updatedCategories));
                return updatedCategories
            });
        };
    }, []);

    // NEW TODO
    const addHandler = (toDo, category, highPriority) => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos];
            updatedToDos.push({
                id: Math.random().toString(),
                content: toDo,
                created: new Date(),
                category: category,
                highPriority: highPriority,
                completed: false,
                deleted: false
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            console.log('To do added ✅');
            return updatedToDos;
        });
    };

    // NEW CATEGORY
    const addCategoryHandler = newCategory => {
        setCategories(prevCat => {
            const updatedCat = [...prevCat];
            updatedCat.push(newCategory);
            localStorage.setItem('Categories', JSON.stringify(updatedCat));
            console.log('Category added ✅');
            return updatedCat;
        });
    };

    // DELETE CATEGORY
    const deleteCategoryHandler = category => {
        setCategories(prev => {
            const updatedCategories = [...prev].filter(cat => cat !== category);
            localStorage.setItem('Categories', JSON.stringify(updatedCategories));
            return updatedCategories;
        });
    };

    // COMPLETE TODO
    const completeHandler = id => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos].map(toDo => {
                if (toDo.id === id)
                    return { ...toDo, completed: !toDo.completed };
                else return toDo;
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });
    };

    // EDIT TODO
    const editHandler = (id, toDoContent) => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos].map(toDo => {
                if (toDo.id === id) return { ...toDo, content: toDoContent };
                else return toDo;
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });
    };

    // EDIT TODO CATEGORY
    const editCategoryHandler = (id, category) => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos].map(todo => {
                if (todo.id === id) return { ...todo, category: category };
                else return todo;
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });
    };

    // EDIT TODO PRIORITY 
    const editPriorityHandler = id => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos].map(toDo => {
                if (toDo.id === id) return { ...toDo, highPriority: !toDo.highPriority };
                else return toDo;
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });
    };

    // LIST TODOS
    const setListByHandler = category => {
        category = category.toLowerCase();
        setListBy(category);
    };

    const listToDosBy = todos => {
        if (listBy === 'all')
            return todos;
        else if (listBy === 'today') {
            let today = new Date().toString().slice(0, 10);

            todos = todos.map(todo => {
                return { ...todo, created: new Date(todo.created) } // Translate string to date
            });

            return todos.filter(todo => todo.created.toString().slice(0, 10) === today);
        } else if (listBy === 'deleted') return todos.filter(todo => todo.deleted === true);
        return todos.filter(todo => todo.category.toLowerCase() === listBy);
    };

    const setSearchHandler = word => {
        setSearch(word);
    };

    const searchToDos = todos => {
        if (search !== '')
            return todos.filter(todo => todo.content.toLowerCase().includes(search.toLowerCase()));
        else return todos;
    };

    const listToDosHandler = sortBy => {
        if (sortBy === 'least-recent')
            return listToDosBy(searchToDos(toDos));

        if (sortBy === 'most-recent') {
            const sortedByDate = toDos.map(toDo => {
                return { ...toDo, created: new Date(toDo.created) } // Translate string to date
            }).sort((a, b) => b.created - a.created);

            return listToDosBy(searchToDos(sortedByDate));
        };

        if (sortBy === 'priority') {
            const sortByPriority = [
                ...toDos.filter(toDo => toDo.highPriority),
                ...toDos.filter(toDo => !toDo.highPriority)
            ];
            return listToDosBy(searchToDos(sortByPriority));
        };
    };

    // DELETE/RECOVER TODO
    const deleteHandler = id => {
        setToDos(prevToDos => {
            const updatedToDos = [...prevToDos].map(todo => {
                if (todo.id === id) return { ...todo, deleted: !todo.deleted };
                else return todo;
            });
            localStorage.setItem('ToDos', JSON.stringify(updatedToDos));
            return updatedToDos;
        });
    };

    // DELETE ALL TODOS
    const deleteAllHander = () => {
        setToDos(() => {
            const updatedToDos = [];
            localStorage.removeItem('ToDos');
            return updatedToDos;
        });

        setCategories(() => {
            const updatedCat = ['None'];
            localStorage.setItem('Categories', JSON.stringify(updatedCat));
            return updatedCat;
        });
    };

    return (
        <Context.Provider
            value={{
                toDos: toDos,
                categories: categories,
                listBy: listBy,
                mobileMenu: showMobileMenu,
                onShowMobileMenu: setShowMobileMenuHandler,
                onAdd: addHandler,
                onCategoryAdd: addCategoryHandler,
                onCategoryDelete: deleteCategoryHandler,
                onComplete: completeHandler,
                onEdit: editHandler,
                onCategoryEdit: editCategoryHandler,
                onPriorityChange: editPriorityHandler,
                onSetListBy: setListByHandler,
                onSetSearch: setSearchHandler,
                onListToDos: listToDosHandler,
                onDelete: deleteHandler,
                onDeleteAll: deleteAllHander,
                onLoadToDos: loadToDosHandler
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export default Context;
