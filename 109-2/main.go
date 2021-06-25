package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
)

// -------------------- database --------------------

type TableEntry struct {
	Reviewed bool   `json:"reviewed"` // TODO
	Word     string `json:"word"`
}

type Table struct {
	lock    sync.RWMutex
	Content []TableEntry `json:"content"`
}

func NewTableEntry(word string) (ret TableEntry) {
	ret.Reviewed = false
	ret.Word = word
	return
}

func NewTable() (ret Table) {
	ret.lock = sync.RWMutex{}
	ret.Content = make([]TableEntry, 0)
	return
}

func (tab *Table) insert(word string) {
	tab.lock.Lock()
	tab.Content = append(tab.Content, NewTableEntry(word))
	tab.lock.Unlock()
}

func (tab *Table) getContent() (ret []string) {
	tab.lock.RLock()
	ret = make([]string, 0)
	for _, entry := range tab.Content {
		ret = append(ret, entry.Word)
	}
	tab.lock.RUnlock()
	return
}

// -------------------- signal --------------------

func loadDBFromFile() {
	if _, err := os.Stat("db.json"); os.IsNotExist(err) {
		return
	}

	jsonFile, err := os.Open("db.json")
	if err != nil {
		log.Fatal(err)
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &db)
}

func writeDBToFile() {
	byteValue, err := json.MarshalIndent(db, "", "    ")
	if err != nil {
		log.Fatal(err)
	}

	if err := ioutil.WriteFile("db.json", byteValue, 0644); err != nil {
		log.Fatal(err)
	}
}

// -------------------- web server --------------------

var cacheForHandler http.Handler
var db Table

func handlerHomePage(w http.ResponseWriter, r *http.Request) {
	log.Printf("[%v] %v\n", r.RemoteAddr, r.RequestURI)

	if cacheForHandler == nil {
		cacheForHandler = http.FileServer(http.Dir("./static"))
	}
	cacheForHandler.ServeHTTP(w, r)
}

func handlerData(w http.ResponseWriter, r *http.Request) {
	log.Printf("[%v] get data\n", r.RemoteAddr)

	data := make([]string, 0)
	for _, word := range db.getContent() {
		data = append(data, word)
	}

	byteValue, _ := json.Marshal(data)
	w.Write(byteValue)
}

func handlerSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	r.ParseMultipartForm(128)
	word := r.FormValue("word")

	db.insert(word)
	log.Printf("[%v] submit \"%v\"\n", r.RemoteAddr, word)

	fmt.Fprintln(w, "OK.")
}

// -------------------- main --------------------

func main() {
	// setup log file
	logFile, err := os.OpenFile("log.txt", os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
	if err != nil {
		panic(err)
	}
	mw := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(mw)

	// set up signal
	loadDBFromFile()
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	go func() {
		<-ch // keyboard interrupt
		log.Println("receive keyboard interrupt, saving db ...")
		writeDBToFile()
		os.Exit(0)
	}()

	// setup web server
	http.HandleFunc("/submit", handlerSubmit)
	http.HandleFunc("/data", handlerData)
	http.HandleFunc("/", handlerHomePage)

	log.Println("listening on port 8080 ...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
